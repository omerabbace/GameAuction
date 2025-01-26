// src/middlewares/rateLimiterMiddleware.js
const rateLimit = require('express-rate-limit');

// Create rate limiter configurations
const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs, // Time window in milliseconds
    max: max, // Limit each IP to X requests per window
    message: {
      status: 'error',
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(options.message);
    }
  });
};

// Different rate limiters for different routes
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, 
  'Too many login attempts, please try again after 15 minutes'
);

const apiLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  100,
  'Too many requests, please try again later'
);

const createAuctionLimiter = createLimiter(
  24 * 60 * 60 * 1000, // 24 hours
  10,
  'You have reached the maximum number of auction creations per day'
);

module.exports = {
  authLimiter,
  apiLimiter,
  createAuctionLimiter
};
