const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 5001; 
const bodyParser = require('body-parser');

// Kafka setup
const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['kafka:9092'] });
const producer = kafka.producer();

//added for troubleshoot regarding docker testing
//requests from frontend (server.js) API were being rejected.
//not really needed for the final build
const corsOptions = {
    origin: [
        'http://localhost:3000', // Frontend
        'http://localhost:8080', // Keycloak server
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  };
  
app.use(cors(corsOptions)); // Apply CORS with the specified options
app.use(express.json());
app.use(bodyParser.json());


//For container use
const pool = new Pool({
    user: process.env.DB_USER,  
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT,
});

async function sendOrderToKafka(order) {
    await producer.connect();
    await producer.send({
        topic: 'order-topic',
        messages: [{ value: JSON.stringify(order) }],
    });
    await producer.disconnect();
}

// API endpoints
//get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

//get a specific order by ID
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

//create a new order
app.post('/api/orders', async (req, res) => {
    const { products, total_price, status } = req.body;

    if (!products || !total_price || !status) {
        return res.status(400).send('All fields are required');
    }

    try {
        const result = await pool.query(
            'INSERT INTO orders (products, total_price, status) VALUES ($1, $2, $3) RETURNING *',
            [JSON.stringify(products), total_price, status]
        );
        const order = result.rows[0];
        // Send the new order to Kafka
        await sendOrderToKafka(order);
        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Orders API server is running on port:${PORT}`);
});