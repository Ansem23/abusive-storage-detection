// Switch to the database (creates if it doesn't exist)
use('milkchain');

// Create a collection (like a table)
db.createCollection('producer');

// Insert a document into the collection
db.products.insertOne({
  name: "Smartwatch",
  price: 120,
  inStock: true,
  category: "electronics"
});

// Query the collection
db.products.find();
