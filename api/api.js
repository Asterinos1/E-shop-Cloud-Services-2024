const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

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



// Start the API server
app.listen(PORT, () => {
    console.log(`API server is running on http://localhost:${PORT}`);
});
