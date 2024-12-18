const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API endpoint to get products
app.get('/products', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/api/products');
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products');
    }
});

// Serve the index.html file by default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
