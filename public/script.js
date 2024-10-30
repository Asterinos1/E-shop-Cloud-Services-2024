// Fetch products from the server and display on the homepage
async function loadProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        
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
        
            // Append elements to the product item
            li.appendChild(img);
            li.appendChild(name);
            li.appendChild(price);
            li.appendChild(description);
            li.appendChild(quantity);
            
            productList.appendChild(li);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}


// Call relevant functions based on the page
document.addEventListener("DOMContentLoaded", () => {
    if (document.body.id === 'homepage') {
        loadProducts();
    } else if (document.body.id === 'cart-page') {
        // loadCart();
    } else if (document.body.id === 'orders-page') {
        // loadOrders();
    }
});
