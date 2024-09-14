
import json
import sqlite3
import requests
import time

# Define the API endpoint and headers
url = "https://api.sallinggroup.com/v1/food-waste"
headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {os.getenv('API_KEY')}"
}

# List of geocodes to cover Denmark, spaced apart by around 100 km
geocodes = [
    "56.2639,9.5018",   # Central Denmark
    "55.6761,12.5683",  # Copenhagen area
    "57.0488,9.9217",   # Aalborg area
    "55.4038,10.4024",  # Odense area
    "55.6804,12.5871",  # Roskilde area
    "56.1629,10.2039",  # Aarhus area
]

radius = 100  # Maximum allowed radius by the API

# Initialize database connection
conn = sqlite3.connect('data.db')
cursor = conn.cursor()

# Drop the offers and stores tables if they exist to change the schema (optional)
cursor.execute('DROP TABLE IF EXISTS offers')
cursor.execute('DROP TABLE IF EXISTS stores')

# Create tables if they don't exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    ean TEXT PRIMARY KEY,
    description TEXT,
    categories_da TEXT,
    categories_en TEXT,
    image TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT,
    brand TEXT,
    city TEXT,
    country TEXT,
    street TEXT,
    zip TEXT,
    latitude REAL,
    longitude REAL
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ean TEXT,
    store_id TEXT,
    currency TEXT,
    discount REAL,
    newPrice REAL,
    originalPrice REAL,
    percentDiscount REAL,
    stock REAL,
    stockUnit TEXT,
    startTime TEXT,
    endTime TEXT,
    lastUpdate TEXT,
    FOREIGN KEY (ean) REFERENCES products(ean),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE(ean, store_id, startTime)  -- Add UNIQUE constraint on ean, store_id and startTime
)
''')
conn.commit()

# Function to insert or update store data
def upsert_store(store):
    cursor.execute('''
    INSERT INTO stores (id, name, brand, city, country, street, zip, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        brand=excluded.brand,
        city=excluded.city,
        country=excluded.country,
        street=excluded.street,
        zip=excluded.zip,
        latitude=excluded.latitude,
        longitude=excluded.longitude
    ''', (
        store['id'],
        store['name'],
        store['brand'],
        store['address']['city'],
        store['address']['country'],
        store['address']['street'],
        store['address']['zip'],
        store['coordinates'][1],
        store['coordinates'][0]
    ))
    conn.commit()

# Function to insert or update product data
def upsert_product(product):
    cursor.execute('''
    INSERT INTO products (ean, description, categories_da, categories_en, image)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(ean) DO UPDATE SET
        description=excluded.description,
        categories_da=excluded.categories_da,
        categories_en=excluded.categories_en,
        image=excluded.image
    ''', (
        product['ean'],
        product['description'],
        product['categories'].get('da', ''),
        product['categories'].get('en', ''),
        product['image']
    ))
    conn.commit()

# Function to insert or update offer data
def upsert_offer(offer, store_id):
    cursor.execute('''
    INSERT INTO offers (ean, store_id, currency, discount, newPrice, originalPrice, percentDiscount, stock, stockUnit, startTime, endTime, lastUpdate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(ean, store_id, startTime) DO UPDATE SET
        currency=excluded.currency,
        discount=excluded.discount,
        newPrice=excluded.newPrice,
        originalPrice=excluded.originalPrice,
        percentDiscount=excluded.percentDiscount,
        stock=excluded.stock,
        stockUnit=excluded.stockUnit,
        endTime=excluded.endTime,
        lastUpdate=excluded.lastUpdate
    ''', (
        offer['ean'],
        store_id,
        offer['currency'],
        offer['discount'],
        offer['newPrice'],
        offer['originalPrice'],
        offer['percentDiscount'],
        offer['stock'],
        offer['stockUnit'],
        offer['startTime'],
        offer['endTime'],
        offer['lastUpdate']
    ))
    conn.commit()

# Function to fetch and process data from the API for each geocode
def fetch_and_process_data():
    for geo in geocodes:
        params = {
            'geo': geo,
            'radius': radius
        }

        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            data = response.json()
            print(f"Data received for geo: {geo}")

            # Iterate over the outer list
            for store_data in data:
                if 'store' in store_data:
                    # Upsert store information
                    upsert_store(store_data['store'])

                    # Process clearances for each store
                    if 'clearances' in store_data:
                        for clearance in store_data['clearances']:
                            process_clearance(clearance, store_data['store']['id'])

        else:
            print(f"Request failed with status code {response.status_code} for geo: {geo}")
            print(f"Response content: {response.text}")

        # Sleep for a short time between requests to different geocodes
        time.sleep(5)

# Function to process each clearance
def process_clearance(clearance, store_id):
    try:
        product = clearance.get('product')
        offer = clearance.get('offer')

        if product and offer:
            # Upsert product and offer
            upsert_product(product)
            upsert_offer(offer, store_id)
        else:
            print(f"Missing product or offer in clearance: {clearance}")
    except KeyError as e:
        print(f"Missing key in clearance data: {e}")
    except Exception as e:
        print(f"Error processing clearance: {e}")

# Main loop to periodically fetch and process data
if __name__ == "__main__":
    try:
        fetch_and_process_data()
    except Exception as e:
        print(f"An error occurred: {e}")
        time.sleep(60)  # Retry after delay if an error occurs

# Close database connection when the script is terminated
conn.close()
