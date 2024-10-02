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
            let products = {};
            let stores = {};

            // Check if products and stores exist in data
            if (!data.products || !data.stores) {
                console.error("Products or Stores data is missing in the fetched JSON");
                return;
            }

            // Map product EAN to product details
            data.products.forEach(product => {
                products[product[0]] = {
                    description: product[1],
                    category: product[2],
                    image: product[4]
                };
            });

            // Map store ID to store details
            data.stores.forEach(store => {
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

const populateOffersTable = (offers) => {
    const offersTable = document.querySelector("#offers-table tbody");
    offersTable.innerHTML = "";  // Clear existing rows

    if (offers.length === 0) {
        console.warn("No offers found to populate the table.");
    }

    offers.forEach(offer => {
        const product = products[offer[1]]; // Fetch the product by EAN
        const store = stores[offer[2]];

        if (product) {
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
            row.addEventListener("click", () => {
                showProductModal(product);
            });
            offersTable.appendChild(row);
        } else {
            console.warn(`Product with EAN ${offer[1]} not found in products data.`);
        }
    });

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
};

// Show Product Modal
const showProductModal = (product) => {
    document.getElementById("modalProductImage").src = product.image;
    document.getElementById("modalProductDescription").innerText = product.description;
    document.getElementById("modalProductCategory").innerText = `Category: ${product.category}`;
    new bootstrap.Modal(document.getElementById('productModal')).show();
};

// Initial table population
populateOffersTable(offersData);

// Store Filter Logic
document.getElementById("storeFilter").addEventListener("change", function () {
    const selectedStore = this.value;
    let filteredOffers = offersData;
    if (selectedStore !== "all") {
        filteredOffers = offersData.filter(offer => offer[2] === selectedStore);
    }
    populateOffersTable(filteredOffers);
});
});
});
