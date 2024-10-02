document.addEventListener("DOMContentLoaded", () => {
    fetch("database_data.json")
        .then(response => response.json())
        .then(data => {
            let offersData = data.offers;
            let products = {};
            let stores = {};

            // Map product EAN to product details
            data.products.forEach(product => {
                products[product[0]] = {
                    description: product[1],
                    category: product[2],
                    image: product[4]
                };
            });

            // Map store ID to store name
            data.stores.forEach(store => {
                stores[store[0]] = {
                    name: store[1],
                    brand: store[2],
                    city: store[3],
                    country: store[4],
                    street: store[5]
                };
                const option = document.createElement("option");
                option.value = store[0];
                option.text = store[1];
                document.getElementById("storeFilter").appendChild(option);
            });

            // Function to populate offers in the table
            const populateOffersTable = (offers) => {
                const offersTable = document.querySelector("#offers-table tbody");
                offersTable.innerHTML = "";  // Clear existing rows
                offers.forEach(offer => {
                    const product = products[offer[1]];
                    const store = stores[offer[2]];

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>
                            <img src="${product.image}" alt="${product.description}" class="product-image">
                            ${product.description}
                        </td>
                        <td data-bs-toggle="tooltip" title="${store.street}, ${store.city}, ${store.country}">
                            ${store.name}
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
                });

                // Initialize Bootstrap tooltips
                var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
                var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl)
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
