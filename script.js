document.addEventListener("DOMContentLoaded", () => {
    fetch("database_data.json")
        .then(response => response.json())
        .then(data => {
            let offersData = data.offers;
            let stores = {};

            // Populate Store Filter Dropdown
            data.stores.forEach(store => {
                stores[store[0]] = store[1];  // Map store ID to store name
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
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${offer[1]}</td>
                        <td>${stores[offer[2]] || "Unknown Store"}</td>
                        <td>${offer[3]}</td>
                        <td>${offer[5]}</td>
                        <td>${offer[6]}</td>
                        <td>${offer[4]}</td>
                    `;
                    offersTable.appendChild(row);
                });
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

            // Sorting Logic
            document.querySelectorAll(".sortable").forEach(header => {
                header.addEventListener("click", function () {
                    const sortBy = this.dataset.sort;
                    let sortedOffers = offersData.sort((a, b) => {
                        if (sortBy === "ean") {
                            return a[1].localeCompare(b[1]);
                        } else if (sortBy === "store") {
                            return stores[a[2]].localeCompare(stores[b[2]]);
                        } else if (sortBy === "newPrice" || sortBy === "originalPrice") {
                            return a[sortBy === "newPrice" ? 5 : 6] - b[sortBy === "newPrice" ? 5 : 6];
                        }
                    });
                    populateOffersTable(sortedOffers);
                });
            });
        });
});
