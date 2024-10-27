// Fetch products from the server and display on the homepage
async function loadProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Clear any existing content
        
        products.forEach(product => {
            const li = document.createElement('li');
            li.classList.add('product-item'); // Add class for styling
            li.textContent = `Name: ${product.name}, Price: ${product.price}`;
            productList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Fetch shopping cart items and display on the cart page
async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const cartItems = await response.json();
        
        const cartList = document.getElementById('cart-list');
        cartList.innerHTML = ''; // Clear existing content
        
        cartItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `Item: ${item.name}, Quantity: ${item.quantity}`;
            cartList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Fetch orders and display on the orders page
async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = ''; // Clear existing content
        
        orders.forEach(order => {
            const li = document.createElement('li');
            li.textContent = `Order ID: ${order.id}, Total: ${order.total}`;
            ordersList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Call relevant functions based on the page
document.addEventListener("DOMContentLoaded", () => {
    if (document.body.id === 'homepage') {
        loadProducts();
    } else if (document.body.id === 'cart-page') {
        loadCart();
    } else if (document.body.id === 'orders-page') {
        loadOrders();
    }
});


