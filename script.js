const populateOffersTable = (offers) => {
    const offersTable = document.querySelector("#offers-table tbody");
    offersTable.innerHTML = "";  // Clear existing rows

    if (offers.length === 0) {
        console.warn("No offers found to populate the table.");
        return;
    }

    offers.forEach(offer => {
        const product = products[offer[1]]; // Fetch the product by EAN
        const store = stores[offer[2]];

        if (!product) {
            console.warn(`Product with EAN ${offer[1]} not found in products data.`);
            return;  // Skip this offer since the product is not found
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <img src="${product.image || ''}" alt="${product.description || 'No Image'}" class="product-image">
                ${product.description || 'Unknown Product'}
            </td>
            <td data-bs-toggle="tooltip" title="${store ? store.street + ', ' + store.city + ', ' + store.country : 'Unknown Store'}">
                ${store ? store.name : 'Unknown Store'}
            </td>
            <td>${offer[3]}</td>
            <td>${offer[5]}</td>
            <td>${offer[6]}</td>
            <td>${offer[4]}</td>
        `;
        
        // Add click event to show product modal
        row.addEventListener("click", () => {
            showProductModal(product);
        });
        
        offersTable.appendChild(row);
    });

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
};
