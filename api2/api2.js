const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 5001; // Different port to avoid conflict with api.js

// Middleware
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Enable CORS
app.use(cors()); // This will allow all origins

// Configure PostgreSQL connection to the orders_db
// const pool = new Pool({
//     user: 'postgres',  
//     host: 'localhost',
//     database: 'orders_db',  // Connect to orders_db
//     password: 'asterinos', // Your password
//     port: 5432,
// });

// const pool = new Pool({
//     user: 'postgres',
//     host: 'orders_db',  // Use service name here
//     database: 'orders_db',
//     password: 'asterinos',
//     port: 5432,
// });

// Configure the PostgreSQL connection using environment variables
const pool = new Pool({
    user: process.env.DB_USER,  
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT,
});




// API endpoint to get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// API endpoint to get a specific order by ID
app.get('/api/orders/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('Order not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// API endpoint to create a new order
app.post('/api/orders', async (req, res) => {
    const { products, total_price, status } = req.body;

    // Validate input
    if (!products || !total_price || !status) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Insert into the database with products being passed as a JSON object
        const result = await pool.query(
            'INSERT INTO orders (products, total_price, status) VALUES ($1, $2, $3) RETURNING *',
            [JSON.stringify(products), total_price, status] // Convert products to JSON format
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// API endpoint to update an order by ID
app.put('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { products, total_price, status } = req.body;

    // Validate input
    if (!products && !total_price && !status) {
        return res.status(400).send('At least one field is required to update');
    }

    try {
        const result = await pool.query(
            `UPDATE orders
             SET products = COALESCE($1, products),
                 total_price = COALESCE($2, total_price),
                 status = COALESCE($3, status)
             WHERE id = $4 RETURNING *`,
            [products, total_price, status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Order not found');
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// API endpoint to delete an order by ID
app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('Order not found');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Start the API server
app.listen(PORT, () => {
    console.log(`API server for orders is running on http://localhost:${PORT}`);
});