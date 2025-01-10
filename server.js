const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

// new stuff for keycloak
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

// new end

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// For image upload, will be completed at some point.
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(cors());

app.use(cors({
    origin: [
        'http://localhost:3000', // Frontend
        'http://localhost:8080', // Keycloak server
        'http://localhost:3000/products',
    ],
    credentials: true,              // Allow cookies and credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Authorization', 'Content-Type'], // Allowed headers
}));

// new stuff for keycloak
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));

app.use(keycloak.middleware());
// new end

//new for docker use
const apiUrl = 'http://api:5000/api/products'; 

// Protect routes 
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