const { MongoClient } = require('mongodb');

let client;
let db;

/**
 * Connect to MongoDB using MONGO_URI from environment variables
 * and initialize required indexes.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in .env');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db();

  // Enforce unique email addresses at the database level
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  console.log(`[DB] Connected to MongoDB: ${db.databaseName}`);
  return db;
}

/**
 * Return the active MongoDB database instance.
 */
function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

/**
 * Gracefully close the MongoDB connection.
 */
async function closeDB() {
  if (client) {
    await client.close();
  }
}

module.exports = { connectDB, getDB, closeDB };
