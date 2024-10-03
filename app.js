let productsData = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentPage = 1;
const productsPerPage = 8;

document.addEventListener('DOMContentLoaded', () => {
    fetch('database_data.json')
        .then(response => response.json())
        .then(data => {
            productsData = data.products;
            filteredProducts = productsData; // Start with all products

            // Render initial products and cart
            renderProducts();
            updateCartCount();
        });

    // Add event listeners for filters, search, etc.
    document.getElementById('search').addEventListener('input', handleSearch);
    document.getElementById('category-filter').addEventListener('change', applyFilters);
    document.getElementById('sort-filter').addEventListener('change', applyFilters);
    document.getElementById('price-filter').addEventListener('input', applyFilters);

    document.getElementById('prev-page').addEventListener('click', prevPage);
    document.getElementById('next-page').addEventListener('click', nextPage);
});

function handleSearch(event) {
    const searchValue = event.target.value.toLowerCase();
    filteredProducts = productsData.filter(product => 
        product[1].toLowerCase().includes(searchValue) || 
        product[2].toLowerCase().includes(searchValue)
    );
    currentPage = 1;
    renderProducts();
}

function applyFilters() {
    const category = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-filter').value;
    const maxPrice = document.getElementById('price-filter').value;

    document.getElementById('price-value').textContent = `Up to $${maxPrice}`;

    filteredProducts = productsData.filter(product => {
        let inCategory = category === 'all' || product[2].toLowerCase().includes(category.toLowerCase());
        let underPrice = parseFloat(product[3]) <= parseFloat(maxPrice);
        return inCategory && underPrice;
    });

    if (sortBy === 'name') {
        filteredProducts.sort((a, b) => a[1].localeCompare(b[1]));
    } else if (sortBy === 'price') {
        filteredProducts.sort((a, b) => parseFloat(a[3]) - parseFloat(b[3]));
    }

    currentPage = 1;
    renderProducts();
}

function renderProducts() {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    paginatedProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        const productImage = document.createElement('img');
        productImage.src = product[4] || 'placeholder.jpg'; 
        productImage.alt = product[1];

        const productTitle = document.createElement('h3');
        productTitle.textContent = product[1];

        const productCategory = document.createElement('p');
        productCategory.textContent = product[2];

        const productPrice = document.createElement('p');
        productPrice.textContent = `$${product[3]}`;

        productDiv.addEventListener('click', () => openModal(product));

        productDiv.appendChild(productImage);
        productDiv.appendChild(productTitle);
        productDiv.appendChild(productCategory);
        productDiv.appendChild(productPrice);
        productGrid.appendChild(productDiv);
    });

    updatePagination();
}

function updatePagination() {
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage * productsPerPage >= filteredProducts.length;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
    }
}

function nextPage() {
    if (currentPage * productsPerPage < filteredProducts.length) {
        currentPage++;
        renderProducts();
    }
}

function openModal(product) {
    const modal = document.getElementById('product-modal');
    document.getElementById('modal-img').src = product[4] || 'placeholder.jpg';
    document.getElementById('modal-title').textContent = product[1];
    document.getElementById('modal-category').textContent = `Category: ${product[2]}`;
    document.getElementById('modal-code').textContent = `Product Code: ${product[0]}`;
    document.getElementById('modal-desc').textContent = product[3] || 'No description available.';

    document.getElementById('add-to-cart').onclick = () => addToCart(product);
    document.getElementById('add-to-wishlist').onclick = () => addToWishlist(product);

    modal.style.display = 'block';
}

function addToCart(product) {
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToWishlist(product) {
    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

document.querySelector('.close').onclick = () => {
    document.getElementById('product-modal').style.display = 'none';
}
