-- Create the orders table in orders_db
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    products JSONB NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL
);
