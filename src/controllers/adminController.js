const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

class AdminController {
  // Admin Login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate credentials
      const isValid = await Admin.validatePassword(username, password);
      if (!isValid) {
        return res.status(401).json({
          message: "Invalid username or password",
        });
      }

      // Get admin details
      const admin = await Admin.findByUsername(username);

      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          username: admin.username,
        },
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({
        message: "Server error during login",
      });
    }
  }

  // Create Initial Admin (first-time setup)
  static async createAdmin(req, res) {
    try {
      const { username, password, email } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({
          message: "Admin already exists",
        });
      }

      // Create admin
      const adminId = await Admin.createAdmin(username, password, email);

      res.status(201).json({
        message: "Admin created successfully",
        adminId,
      });
    } catch (error) {
      console.error("Admin creation error:", error);
      res.status(500).json({
        message: "Server error during admin creation",
      });
    }
  }
}

module.exports = AdminController;
