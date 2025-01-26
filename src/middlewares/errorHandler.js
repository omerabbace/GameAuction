// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
    // Log error for server-side tracking
    console.error(err.stack);
  
    // Determine error status and message
    const statusCode = err.statusCode || 500;
    const errorResponse = {
      status: 'error',
      statusCode: statusCode,
      message: err.message || 'Internal Server Error',
    };
  
    // Add additional details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }
  
    // Send error response
    res.status(statusCode).json(errorResponse);
  };
  
  // Custom error classes
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
      this.statusCode = 400;
    }
  }
  
  class AuthenticationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AuthenticationError';
      this.statusCode = 401;
    }
  }
  
  class ForbiddenError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ForbiddenError';
      this.statusCode = 403;
    }
  }
  
  module.exports = {
    errorHandler,
    ValidationError,
    AuthenticationError,
    ForbiddenError
  };
  