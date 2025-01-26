// src/controllers/userController.js
const User = require("../models/User");
const TokenUtils = require("../utils/tokenUtils");
const {
  ValidationError,
  AuthenticationError,
} = require("../middlewares/errorHandler");

class UserController {
  // User Registration
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new ValidationError("User with this email already exists");
      }

      // Create new user
      const userId = await User.create(username, email, password);

      // Generate tokens
      const user = { id: userId, username, email };
      const accessToken = TokenUtils.generateToken(user);

      // const refreshToken = TokenUtils.generateRefreshToken(user);

      res.status(201).json({
        message: "User registered successfully",
        userId,
        accessToken,
        // refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  // User Login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate credentials
      const isValid = await User.validatePassword(email, password);
      if (!isValid) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Get user details
      const user = await User.findByEmail(email);

      // Generate tokens
      const accessToken = TokenUtils.generateToken(user);

      // const refreshToken = TokenUtils.generateRefreshToken(user);

      res.json({
        message: "Login successful",
        accessToken,
        // refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get User Profile
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await User.getProfile(userId);

      if (!profile) {
        throw new ValidationError("User profile not found");
      }

      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  // Update User Profile
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { username, email } = req.body;

      // Validate input
      if (!username || !email) {
        throw new ValidationError("Username and email are required");
      }

      const updated = await User.updateProfile(userId, { username, email });

      if (!updated) {
        throw new ValidationError("Profile update failed");
      }

      res.json({
        message: "Profile updated successfully",
        user: { username, email },
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh Token
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = TokenUtils.verifyToken(refreshToken);
      if (!decoded) {
        throw new AuthenticationError("Invalid refresh token");
      }

      // Get user details
      const user = await User.findById(decoded.id);

      // Generate new access token
      const newAccessToken = TokenUtils.generateToken(user);

      res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout (Invalidate Token)
  static async logout(req, res, next) {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (token) {
        // Blacklist the token
        TokenUtils.invalidateToken(token);
      }

      res.json({
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
