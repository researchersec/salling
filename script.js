document.addEventListener("DOMContentLoaded", () => {
    fetch("database_data.json")
        .then(response => response.json())
        .then(data => {
            // Populate Products Table
            const productsTable = document.querySelector("#products-table tbody");
            data.products.forEach(product => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product[0]}</td>
                    <td>${product[1]}</td>
                    <td>${product[2]}</td>
                    <td><img src="${product[4]}" alt="${product[1]}" width="100"></td>
                `;
                productsTable.appendChild(row);
            });

            // Populate Stores Table
            const storesTable = document.querySelector("#stores-table tbody");
            data.stores.forEach(store => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${store[1]}</td>
                    <td>${store[2]}</td>
                    <td>${store[3]}</td>
                    <td>${store[4]}</td>
                    <td>${store[5]}</td>
                `;
                storesTable.appendChild(row);
            });

            // Populate Offers Table
            const offersTable = document.querySelector("#offers-table tbody");
            data.offers.forEach(offer => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${offer[1]}</td>
                    <td>${offer[2]}</td>
                    <td>${offer[3]}</td>
                    <td>${offer[4]}</td>
                    <td>${offer[5]}</td>
                    <td>${offer[6]}</td>
                `;
                offersTable.appendChild(row);
            });
        });
});
