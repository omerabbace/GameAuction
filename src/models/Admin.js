const { pool } = require("../../config/database");
const bcrypt = require("bcryptjs");

class Admin {
  // Find admin by username
  static async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM admin WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }

  // Validate admin password
  static async validatePassword(username, password) {
    const admin = await this.findByUsername(username);
    if (!admin) return false;

    // Direct comparison of passwords (insecure, but fulfills your request)
    return admin.password === password;
  }

  // Create admin (for initial setup)
  static async createAdmin(username, password, email) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO admin (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );

    return result.insertId;
  }
}

module.exports = Admin;
