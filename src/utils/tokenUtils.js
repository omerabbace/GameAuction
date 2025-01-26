// src/utils/tokenUtils.js
const jwt = require('jsonwebtoken');

class TokenUtils {
  // Generate JWT token
  static generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    };

    return jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: process.env.JWT_EXPIRATION || '1h' 
      }
    );
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Generate refresh token
  static generateRefreshToken(user) {
    const payload = {
      id: user.id,
      type: 'refresh'
    };

    return jwt.sign(
      payload, 
      process.env.REFRESH_TOKEN_SECRET, 
      { 
        expiresIn: '7d' 
      }
    );
  }

  // Token blacklist management
  static blacklistedTokens = new Set();

  static invalidateToken(token) {
    this.blacklistedTokens.add(token);
  }

  static isTokenBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }
}

module.exports = TokenUtils;
