import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kodoc_super_secret_key";

// POST /api/auth/signup
// Register a new user
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user record
    user = new User({
      username,
      email,
      password,
    });

    // Save the user to MongoDB
    await user.save();

    // Create the JWT Payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token and return it
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      // Send back the token and user details (excluding password)
      res.status(201).json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST /api/auth/signin
// Authenticate user & get token
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // See if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Create the JWT Payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token and return it
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
