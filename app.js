const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Database connection
const { connectDB } = require("./config/database");

// Route imports
const userRoutes = require("./src/routes/userRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const auctionRoutes = require("./src/routes/auctionRoutes");
const platformRoutes = require("./src/routes/PlatformRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const bidRoutes = require("./src/routes/bidRoutes");

// Error handling middleware
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure CORS to be more permissive
app.use(
  cors({
    origin: "*", // Be more specific in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MIME type configuration middleware
app.use((req, res, next) => {
  // Custom MIME type mappings
  const mimeTypes = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".html": "text/html",
  };

  // Extend Express static file serving with explicit MIME types
  res.setHeader("X-Content-Type-Options", "nosniff");
  express.static.mime.define(mimeTypes);
  next();
});

// Static file serving with explicit configurations
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = {
        ".css": "text/css",
        ".js": "application/javascript",
      }[ext];

      if (mimeType) {
        res.setHeader("Content-Type", mimeType);
      }
    },
  })
);

// Fallback static file serving
app.use(express.static(path.join(__dirname, "")));

// Database connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
