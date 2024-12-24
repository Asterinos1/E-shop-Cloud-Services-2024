const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// For image upload, will be completed at some point.
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());

//new for docker use
const apiUrl = 'http://api:5000/api/products'; 

//endpoint to get products
app.get('/products', async (req, res) => {
    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products');
    }
});

//Default page should be the products page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
});