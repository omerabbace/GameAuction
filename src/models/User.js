// src/models/User.js
const { pool } = require('../../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(username, email, password) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    return rows[0];
  }

  // Validate user password
  static async validatePassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return false;

    return await bcrypt.compare(password, user.password);
  }

  // Get user profile
  static async getProfile(userId) {
    const [rows] = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    return rows[0];
  }
}

module.exports = User;