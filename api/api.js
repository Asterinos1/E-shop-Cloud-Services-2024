const express = require('express');
const { Pool } = require('pg');

//new
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 5000;

// new as of 27/10 
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Enable CORS
app.use(cors()); // This will allow all origins



// Configure the PostgreSQL connection
const pool = new Pool({
    user: 'postgres',  
    host: 'localhost',
    database: 'eshop_db',   
    password: 'asterinos', 
    port: 5432,
});

// API endpoint to get products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// API endpoint to add a new product
app.post('/api/products', async (req, res) => {

    const { name, description, price } = req.body;
    
    if (!name || !description || !price) {
        return res.status(400).send('All fields are required');
    }

    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
            [name, description, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// API endpoint to delete a product by ID
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('Product not found');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// API endpoint to update a product by ID
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    // Validate input
    if (!name && !description && !price) {
        return res.status(400).send('At least one field is required to update');
    }

    try {
        const result = await pool.query(
            `UPDATE products
             SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price)
             WHERE id = $4 RETURNING *`,
            [name, description, price, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Product not found');
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// Start the API server
app.listen(PORT, () => {
    console.log(`API server is running on http://localhost:${PORT}`);
});
