const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const { Pool } = require('pg');
const cors = require('cors'); // Import CORS


const app = express();
const PORT = process.env.PORT || 5000;

// Keycloak setup
const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });
const bodyParser = require('body-parser');
// new as of 27/10 
app.use(express.json());
app.use(bodyParser.json());

app.use(cors({
    origin: [
        'http://localhost:3000', // Frontend
        'http://localhost:8080', // Keycloak server
    ],
    credentials: true,
}));

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));
app.use(keycloak.middleware());


//For container use
const pool = new Pool({
    user: process.env.DB_USER,  
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT,
});

const verifyRole = (role) => (req, res, next) => {
    const roles = req.kauth.grant.access_token.content.realm_access.roles;
    if (roles.includes(role)) {
        return next();
    }
    res.status(403).send('Forbidden');
};

//Get products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

//new secure post, put, delete for the seller only.

app.post('/api/products', keycloak.protect(), verifyRole('seller'), async (req, res) => {
    const { name, description, price, image_url, quantity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, image_url, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, image_url, quantity]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.put('/api/products/:id', keycloak.protect(), verifyRole('seller'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image_url, quantity } = req.body;
    try {
        const result = await pool.query(
            `UPDATE products
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 price = COALESCE($3, price),
                 image_url = COALESCE($4, image_url),
                 quantity = COALESCE($5, quantity)
             WHERE id = $6 RETURNING *`,
            [name, description, price, image_url, quantity, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.delete('/api/products/:id', keycloak.protect(), verifyRole('seller'), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Prodcuts API server is running on port:${PORT}`);
});