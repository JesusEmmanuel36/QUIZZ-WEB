const { MongoClient } = require("mongodb");
require('dotenv').config(); 
 
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB Atlas:", error);
  }
}

module.exports = { client, connectDB };