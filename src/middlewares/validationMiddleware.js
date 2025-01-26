// src/middlewares/validationMiddleware.js
const { ValidationError } = require("./errorHandler");

class ValidationMiddleware {
  // Validate user registration
  static validateRegistration(req, res, next) {
    const { username, email, password } = req.body;

    // Username validation
    if (!username || username.length < 3) {
      throw new ValidationError("Username must be at least 3 characters long");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    // Password validation
    if (!password || password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    next();
  }

  // Validate auction creation
  static validateAuctionCreation(req, res, next) {
    const { game_id, start_price, end_date } = req.body;

    // Game ID validation
    // if (!game_id || typeof game_id !== 'number') {
    //   throw new ValidationError('Invalid game ID');
    // }

    // Price validation
    if (!start_price || start_price <= 0) {
      throw new ValidationError("Start price must be a positive number");
    }

    // End date validation
    const endDate = new Date(end_date);
    if (!endDate || endDate <= new Date()) {
      throw new ValidationError("End date must be in the future");
    }

    next();
  }

  // Validate bid placement
  static validateBidPlacement(req, res, next) {
    const { bid_amount } = req.body;

    // Bid amount validation
    if (!bid_amount || bid_amount <= 0) {
      throw new ValidationError("Bid amount must be a positive number");
    }

    next();
  }

  // Sanitize input (prevent XSS)
  static sanitizeInput(req, res, next) {
    const sanitizeString = (input) => {
      if (typeof input === "string") {
        return input
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;");
      }
      return input;
    };

    // Recursively sanitize request body
    const sanitizeObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((acc, key) => {
          acc[key] = sanitizeObject(obj[key]);
          return acc;
        }, {});
      }
      return sanitizeString(obj);
    };

    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
  }
}

module.exports = ValidationMiddleware;
