import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import our routes
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import versionRoutes from "./routes/versions.js";

// Load environment variables if we have a .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Allows our frontend to communicate with the backend
app.use(express.json()); // Allows us to read JSON data from the frontend requests

// Connect to MongoDB Local
const MONGO_URI = "mongodb://127.0.0.1:27017/kodoc";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Local successfully!"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Basic route to check if server is running
app.get("/", (req, res) => {
  res.send("Kodoc API is running!");
});

// Setup API Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
// We mount versions under documents as well, or separate, based on preference.
// In the brief: /api/documents/:docId/versions. So we can mount it under /api/documents or handle it directly in version routes.
// To keep it simple, we will mount versionRoutes at /api/documents
app.use("/api/documents", versionRoutes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
