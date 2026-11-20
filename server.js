require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public'));

function serverError(res, err) {
  console.error(err.message);
  res.status(500).json({ error: 'Сервер қатесі' });
}

// pg қателерін өңдеу: 400 немесе 500
function handleDbError(res, err) {
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Көрсетілген category_id жоқ' });
  }
  if (err.code === '23505') {
    return res.status(400).json({ error: 'Мұндай атау бұрыннан бар' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'price және stock теріс болмауы керек' });
  }
  if (err.code === '22003') {
    return res.status(400).json({ error: 'Сан тым үлкен' });
  }
  serverError(res, err);
}

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'id бүтін сан болуы керек' });
    return null;
  }
  return id;
}

// Тауар деректерін тексеру
function readProduct(body) {
  const name = (body.name || '').trim();
  const price = Number(body.price);
  const stock = body.stock === undefined || body.stock === '' ? 0 : Number(body.stock);
  const categoryId = Number(body.category_id);

  if (!name) return { error: 'name міндетті' };
  if (body.price === undefined || body.price === '' || Number.isNaN(price) || price < 0) {
    return { error: 'price теріс емес сан болуы керек' };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: 'stock теріс емес бүтін сан болуы керек' };
  }
  if (!Number.isInteger(categoryId)) {
    return { error: 'category_id міндетті' };
  }
  return { name, price, stock, categoryId };
}

const PRODUCT_SELECT = `
  SELECT p.id, p.name, p.price, p.stock, p.category_id, c.name AS category
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

// ---------- CATEGORIES ----------
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    serverError(res, err);
  }
});

app.post('/api/categories', async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'name міндетті' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleDbError(res, err);
  }
});

// ---------- PRODUCTS ----------
// GET тізім + JOIN + ?q= іздеу
app.get('/api/products', async (req, res) => {
  const q = '%' + (req.query.q || '') + '%';
  try {
    const result = await pool.query(
      PRODUCT_SELECT + ' WHERE p.name ILIKE $1 ORDER BY p.id',
      [q]
    );
    res.json(result.rows);
  } catch (err) {
    serverError(res, err);
  }
});

// GET бір тауар
app.get('/api/products/:id', async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  try {
    const result = await pool.query(PRODUCT_SELECT + ' WHERE p.id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тауар табылмады' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

// POST
app.post('/api/products', async (req, res) => {
  const p = readProduct(req.body);
  if (p.error) {
    return res.status(400).json({ error: p.error });
  }
  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, stock, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [p.name, p.price, p.stock, p.categoryId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleDbError(res, err);
  }
});

// PUT
app.put('/api/products/:id', async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  const p = readProduct(req.body);
  if (p.error) {
    return res.status(400).json({ error: p.error });
  }
  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, stock = $3, category_id = $4 WHERE id = $5 RETURNING *',
      [p.name, p.price, p.stock, p.categoryId, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Тауар табылмады' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    handleDbError(res, err);
  }
});

// DELETE
app.delete('/api/products/:id', async (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Тауар табылмады' });
    }
    res.json({ message: 'Жойылды', id: result.rows[0].id });
  } catch (err) {
    serverError(res, err);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Сервер http://localhost:' + (process.env.PORT || 3000) + ' мекенжайында жұмыс істеп тұр');
});