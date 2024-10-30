let allProducts = []; // Store all products globally to filter later
let cart = {}; // Store cart items with their quantities

async function loadProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        
        allProducts = products; // Store products in the global variable
        displayProducts(allProducts); // Display all products initially

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Function to display the list of products
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        const li = document.createElement('li');
        li.classList.add('product-item');
        
        // Create product details
        const name = document.createElement('h3');
        name.textContent = product.name;
        
        const price = document.createElement('p');
        price.textContent = `Price: $${product.price}`;
        
        const description = document.createElement('p');
        description.textContent = `Description: ${product.description}`;
    
        // Create image element
        const img = document.createElement('img');
        img.src = product.image_url; // Set image source
        img.alt = product.name; // Set alt text
        img.style.maxWidth = '200px'; // Set maximum width for display
    
        const quantity = document.createElement('p');
        quantity.textContent = `Quantity: ${product.quantity}`;
        
        // Create counter for adding/removing products
        const counterContainer = document.createElement('div');
        const minusButton = document.createElement('button');
        const quantityDisplay = document.createElement('span');
        const plusButton = document.createElement('button');

        minusButton.textContent = '-';
        plusButton.textContent = '+';
        quantityDisplay.textContent = cart[product.id] ? cart[product.id].quantity : 0; // Initial quantity in cart
        
        minusButton.onclick = () => updateCart(product, -1, quantityDisplay);
        plusButton.onclick = () => updateCart(product, 1, quantityDisplay);
        
        // Append buttons and display to counter container
        counterContainer.appendChild(minusButton);
        counterContainer.appendChild(quantityDisplay);
        counterContainer.appendChild(plusButton);
        
        // Append elements to the product item
        li.appendChild(img);
        li.appendChild(name);
        li.appendChild(price);
        li.appendChild(description);
        li.appendChild(quantity);
        li.appendChild(counterContainer);
        
        productList.appendChild(li);
    });
}

// Function to update the cart and the cart display
function updateCart(product, change, quantityDisplay) {
    // Update cart item quantity
    if (!cart[product.id]) {
        cart[product.id] = { ...product, quantity: 0 }; // Initialize if not present
    }
    cart[product.id].quantity += change;
    
    // Ensure the quantity doesn't go below zero
    if (cart[product.id].quantity < 0) {
        cart[product.id].quantity = 0;
    }

    quantityDisplay.textContent = cart[product.id].quantity; // Update UI
    saveCartToLocalStorage(); // Save cart to local storage
    updateCartCount(); // Update cart count display
}

// Function to save cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart)); // Store the cart object as a JSON string
}

// Function to load cart from local storage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart); // Parse JSON string to object
    }
}

// Function to update cart item count display
function updateCartCount() {
    const totalCount = Object.values(cart).reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalCount; // Update cart count in navbar
}

// Function to filter products based on search input
function searchProducts() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    
    // Filter products that match the search input (in name or description)
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchInput) ||
        product.description.toLowerCase().includes(searchInput)
    );
    
    displayProducts(filteredProducts); // Display filtered products
}

// Function to load cart items in cart.html
function loadCart() {
    const cartList = document.getElementById('cart-list');
    const totalPriceElement = document.getElementById('total-price');
    cartList.innerHTML = ''; // Clear existing items
    let total = 0; // Initialize total price

    Object.values(cart).forEach(item => {
        if (item.quantity > 0) {
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price} x ${item.quantity}`;
            cartList.appendChild(li);
            total += item.price * item.quantity; // Add to total
        }
    });

    totalPriceElement.textContent = total.toFixed(2); // Update total price
}

// Function to reset the cart
function resetCart() {
    cart = {}; // Clear the cart
    saveCartToLocalStorage(); // Save empty cart to local storage
    loadCart(); // Refresh cart display
    updateCartCount(); // Update cart count display
}

// Call relevant functions based on the page
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage(); // Load cart from local storage on page load
    updateCartCount(); // Update cart count display

    if (document.body.id === 'homepage') {
        loadProducts();
    } else if (document.body.id === 'cart-page') {
        loadCart();
    } else if (document.body.id === 'orders-page') {
        // loadOrders();
    }
});
