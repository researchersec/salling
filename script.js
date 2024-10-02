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
        products[product[0]] = {
            description: product[1],
            category: product[2],
            image: product[4]
        };
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


// Function to display the product details modal
const showProductModal = (product) => {
    document.getElementById("modalProductImage").src = product.image || '';
    document.getElementById("modalProductDescription").innerText = product.description || 'No description available.';
    document.getElementById("modalProductCategory").innerText = product.category ? `Category: ${product.category}` : 'No category available.';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
};
