let allProducts = []; //storing all products globally to filter later
let cart = {}; //storing cart items with their quantities

const keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'eshop',
    clientId: 'eshop-client',
});

async function initKeycloak() {
    try {
        await keycloak.init({
            onLoad: 'login-required',
            checkLoginIframe: false, // Disable login iframe check if not needed
        });

        if (keycloak.authenticated) {
            console.log('User authenticated:', keycloak.tokenParsed.preferred_username);
            //document.getElementById('user-info').textContent = `Hello, ${keycloak.tokenParsed.preferred_username}`;
            setupRoleBasedUI();
            // Start periodic token refresh
            setInterval(() => {
                keycloak.updateToken(30).then((refreshed) => {
                    if (refreshed) {
                        console.log('[KEYCLOAK] Token refreshed');
                    }
                }).catch((error) => {
                    console.error('[KEYCLOAK] Failed to refresh token:', error);
                    keycloak.logout();
                });
            }, 30000); // Refresh token every 30 seconds
        }
    } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
    }
}

function setupRoleBasedUI() {
    const roles = keycloak.tokenParsed.resource_access?.['eshop-client']?.roles || [];
    if (roles.includes('seller')) {
        console.log("This is a seller")
        document.getElementById('my-products-btn').style.display = 'block';
    } else {
        console.log("This is NOT a seller")
        document.getElementById('my-products-btn').style.display = 'none';
    }
}

function logout() {
    keycloak.logout();
}

// Call Keycloak initialization on page load
document.addEventListener('DOMContentLoaded', initKeycloak);

async function loadProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        
        allProducts = products; //save products in the global variable
        displayProducts(allProducts);

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

//display the list of products
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const li = document.createElement('li');
        li.classList.add('product-item');
        
        //product details
        const name = document.createElement('h3');
        name.textContent = product.name;
        
        const price = document.createElement('p');
        price.textContent = `Price: $${product.price}`;
        
        const description = document.createElement('p');
        description.textContent = `Description: ${product.description}`;
    
        //setting image element
        const img = document.createElement('img');
        img.src = product.image_url; 
        img.alt = product.name; 
        img.style.maxWidth = '200px'; 
    
        const quantity = document.createElement('p');
        quantity.textContent = `Quantity: ${product.quantity}`;
        
        //counter for adding/removing products
        const counterContainer = document.createElement('div');
        const minusButton = document.createElement('button');
        const quantityDisplay = document.createElement('span');
        const plusButton = document.createElement('button');

        minusButton.textContent = '-';
        plusButton.textContent = '+';
        quantityDisplay.textContent = cart[product.id] ? cart[product.id].quantity : 0;
        
        minusButton.onclick = () => updateCart(product, -1, quantityDisplay);
        plusButton.onclick = () => updateCart(product, 1, quantityDisplay);
        
        counterContainer.appendChild(minusButton);
        counterContainer.appendChild(quantityDisplay);
        counterContainer.appendChild(plusButton);
    
        li.appendChild(img);
        li.appendChild(name);
        li.appendChild(price);
        li.appendChild(description);
        li.appendChild(quantity);
        li.appendChild(counterContainer);
        
        productList.appendChild(li);
    });
}

//update the cart and the cart display
function updateCart(product, change, quantityDisplay) {
    if (!cart[product.id]) {
        cart[product.id] = { ...product, quantity: 0 }; //initialize
    }
    cart[product.id].quantity += change;
    
    if (cart[product.id].quantity < 0) {
        cart[product.id].quantity = 0;
    }

    quantityDisplay.textContent = cart[product.id].quantity;
    saveCartToLocalStorage(); //save cart to local storage
    updateCartCount();
}

//save cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart)); 
}

//load cart from local storage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart); // Parse JSON string to object
    }
}

//update cart item count display
function updateCartCount() {
    const totalCount = Object.values(cart).reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalCount; //update cart count in navbar
}

//filter products based on search input
function searchProducts() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchInput) ||
        product.description.toLowerCase().includes(searchInput)
    );
    displayProducts(filteredProducts); 
}

//load cart items in cart.html
function loadCart() {
    const cartList = document.getElementById('cart-list');
    const totalPriceElement = document.getElementById('total-price');
    cartList.innerHTML = ''; 
    let total = 0; 

    Object.values(cart).forEach(item => {
        if (item.quantity > 0) {
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price} x ${item.quantity}`;
            cartList.appendChild(li);
            total += item.price * item.quantity; 
        }
    });

    totalPriceElement.textContent = total.toFixed(2); 
}

//reset the cart
function resetCart() {
    cart = {}; 
    saveCartToLocalStorage(); 
    loadCart(); 
    updateCartCount(); 
}

//place an order
async function placeOrder() {
    const cartItems = Object.values(cart).filter(item => item.quantity > 0);

    if (cartItems.length === 0) {
        alert('Empty cart! Please add products to the cart before placing an order.');
        return; 
    }

    //format products for the API
    const products = cartItems.map(item => ({
        title: item.name,
        amount: item.quantity,
        product_id: item.id
    }));

    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const orderData = {
        products: products, 
        total_price: totalPrice.toFixed(2), 
        status: 'PENDING'
    };

    try {
        // possible error when wroking on localhost
        // const response = await fetch('http://localhost:5001/api/orders'
        const response = await fetch('http://localhost:5001/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData) 
        });

        if (response.ok) {
            alert('Order placed successfully!');
            resetCart();
        } else {
            const errorData = await response.json();
            console.error('Error placing order:', errorData);
            alert('Error placing order. Please try again.');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
}

//load orders and display them on the orders page
async function loadOrders() {
    try {
        // possible error when wroking on localhost
        //const response = await fetch('http://localhost:5001/api/orders');
        const response = await fetch('http://localhost:5001/api/orders');
        const orders = await response.json();

        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            //if no orders
            ordersList.textContent = 'No orders have been placed yet.';
            return;
        }

        orders.forEach(order => {
            const li = document.createElement('li');
            const orderDetails = document.createElement('div');

            let productsDisplay = '';
            order.products.forEach(product => {
                productsDisplay += `${product.title} (x${product.amount}) - Product ID: ${product.product_id}<br>`;
            });

            orderDetails.innerHTML = `
                <h3>Order ID: ${order.id}</h3>
                <p>Products: <br>${productsDisplay}</p>
                <p>Total Price: $${order.total_price}</p>
                <p>Status: ${order.status}</p>
                <hr>
            `;

            li.appendChild(orderDetails);
            ordersList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}


//based on the page, call relevant functions 
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage(); 
    updateCartCount(); 
    if (document.body.id === 'homepage') {
        loadProducts();
    } else if (document.body.id === 'cart-page') {
        loadCart();
    } else if (document.body.id === 'orders-page') {
        loadOrders();
    }
});