import jwt from "jsonwebtoken";

// We use a simple secret key for signing the tokens. 
// In a real app, this would be in a .env file.
const JWT_SECRET = process.env.JWT_SECRET || "kodoc_super_secret_key";

const authMiddleware = (req, res, next) => {
  // Get the token from the request header
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // The token looks like "Bearer <token_string>", so we split by space and take the second part
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach the user information (like their ID) from the token to the request object
    // This way, our route handlers know exactly who is making the request
    req.user = decoded.user;
    
    // Move on to the next function (the actual route handler)
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
