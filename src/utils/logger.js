// src/utils/logger.js
const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'game-auction-platform' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom log methods
logger.logRequest = (req, message) => {
  logger.info(`[REQUEST] ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user ? req.user.id : 'unauthenticated'
  });
};

logger.logError = (error, req) => {
  logger.error(`[ERROR] ${error.message}`, {
    error: error,
    stack: error.stack,
    method: req?.method,
    url: req?.url,
    user: req?.user ? req.user.id : 'unauthenticated'
  });
};

module.exports = logger;
