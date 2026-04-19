import mongoose from "mongoose";

const MONGO_URI = "mongodb://127.0.0.1:27017/kodoc";

async function testConnection() {
  try {
    console.log("Attempting to connect to local MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to MongoDB!");
    console.log(`Database Name: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Port: ${mongoose.connection.port}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    console.log("\nPlease ensure MongoDB Community Server is running on your machine.");
    process.exit(1);
  }
}

testConnection();
