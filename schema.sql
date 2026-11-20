CREATE DATABASE mini_db;
\c mini_db

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id INTEGER NOT NULL REFERENCES categories(id)
);

INSERT INTO categories (name) VALUES
('Electronics'),
('Clothing'),
('Food'),
('Books'),
('Sports');

INSERT INTO products (name, price, stock, category_id) VALUES
('Smartphone', 150000, 12, 1),
('Headphones', 18000, 30, 1),
('T-shirt', 5000, 50, 2),
('Jeans', 14000, 25, 2),
('Chocolate', 800, 200, 3),
('Football', 9000, 15, 5);