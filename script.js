let products = {};  // Declare products globally
let stores = {};    // Declare stores globally

document.addEventListener("DOMContentLoaded", () => {
    fetch("database_data.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            return response.json();
        })
        .then(data => {
            console.log("Data fetched successfully:", data); // Log data to verify

            let offersData = data.offers || [];

            // Populate products and stores first, then populate the offers table
            populateProductsAndStores(data.products, data.stores);

            // Populate table with offers
            populateOffersTable(offersData);

            // Filter by store logic
            document.getElementById("storeFilter").addEventListener("change", function () {
                const selectedStore = this.value;
                let filteredOffers = offersData;

                if (selectedStore !== "all") {
                    filteredOffers = offersData.filter(offer => offer[2] === selectedStore);
                }

                populateOffersTable(filteredOffers);
            });
        })
        .catch(error => {
            console.error("Error fetching or processing data:", error);
        });
});

// Function to populate the products and stores global variables
const populateProductsAndStores = (productsData, storesData) => {
    // Populate the products object with product details
    productsData.forEach(product => {
        products[product[0]] = product; // Store entire product data indexed by EAN
    });

    // Populate the stores object with store details
    storesData.forEach(store => {
        stores[store[0]] = {
            name: store[1],
            brand: store[2],
            city: store[3],
            country: store[4],
            street: store[5]
        };

        // Populate the store filter dropdown
        const option = document.createElement("option");
        option.value = store[0];
        option.text = store[1];
        document.getElementById("storeFilter").appendChild(option);
    });
};

const populateOffersTable = (offers) => {
    const offersTable = document.querySelector("#offers-table tbody");
    offersTable.innerHTML = "";  // Clear existing rows

    if (offers.length === 0) {
        console.warn("No offers found to populate the table.");
        return;
    }

    offers.forEach(offer => {
        const ean = offer[1]; // EAN from the offer data
        const product = products[ean];  // Find the product by EAN
        
        if (!product) {
            console.warn(`Product with EAN ${ean} not found in products data.`);
            return;  // Skip this row if the product is not found
        }

        const productName = product[1];    // Product name
        const productImage = product[4];   // Product image URL
        const store = stores[offer[2]];    // Fetch store by store ID

        // Default placeholders for store details if not found
        const storeName = store ? store.name : 'Unknown Store';
        const storeLocation = store ? `${store.street}, ${store.city}, ${store.country}` : 'Unknown Location';

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <img src="${productImage || 'path_to_placeholder_image.png'}" alt="${productName}" class="product-image" style="width: 50px; height: auto;">
                ${productName}
            </td>
            <td data-bs-toggle="tooltip" title="${storeLocation}">
                ${storeName}
            </td>
            <td>${offer[3]}</td>  <!-- Currency -->
            <td>${offer[5]}</td>  <!-- New Price -->
            <td>${offer[6]}</td>  <!-- Original Price -->
            <td>${offer[4]}</td>  <!-- Discount -->
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

// Function to display the product details modal
const showProductModal = (product) => {
    document.getElementById("modalProductImage").src = product[4] || '';
    document.getElementById("modalProductDescription").innerText = product[1] || 'No description available.';
    document.getElementById("modalProductCategory").innerText = product[2] ? `Category: ${product[2]}` : 'No category available.';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
};
