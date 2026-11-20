# Дүкен (мини-жоба)

Node.js + Express + PostgreSQL. Кестелер: `products` (бас кесте), `categories` (байланысқан кесте).

## Орнату
1. Node.js және PostgreSQL орнатыңыз.
2. Жоба қалтасында тәуелділіктерді орнатыңыз:
   ```
   npm install
   ```
3. Деректер қорын құрыңыз:
   ```
   psql -U postgres -f schema.sql
   ```
4. `.env` файлын құрып, өз деректеріңізді жазыңыз:
   ```
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=құпиясөз
   PGDATABASE=mini_db
   PORT=3000
   ```

## Іске қосу
```
node server.js
```
Браузерде http://localhost:3000 ашыңыз.

## API
- GET /api/products?q=атау: тізім (JOIN + ILIKE іздеу)
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/categories
- POST /api/categories