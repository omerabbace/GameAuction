// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Check if no token
  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded" + decoded);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Token is not valid",
    });
  }
};

// Admin role middleware
const adminMiddleware = (req, res, next) => {
  // Assuming user role is set in the token
  console.log(req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin rights required.",
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};
