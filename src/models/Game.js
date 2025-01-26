// src/models/Game.js
const { pool } = require("../../config/database");

class Game {
  // Create a new game
  static async create(gameData) {
    const { name, platform, age_rating, synopsis, poster_url } = gameData;

    const [result] = await pool.query(
      `INSERT INTO games 
      (name, platform, age_rating, synopsis, poster_url) 
      VALUES (?, ?, ?, ?, ?)`,
      [name, platform, age_rating, synopsis, poster_url]
    );

    return result.insertId;
  }

  // Get all games with optional filtering
  static async findAll(filters = {}) {
    let query = "SELECT * FROM games WHERE 1=1";
    const queryParams = [];

    // Add filtering options
    if (filters.platform) {
      query += " AND platform = ?";
      queryParams.push(filters.platform);
    }

    if (filters.name) {
      query += " AND name LIKE ?";
      queryParams.push(`%${filters.name}%`);
    }

    // Add sorting
    query += " ORDER BY ";
    query += filters.sortBy || "name";
    query += filters.sortOrder ? ` ${filters.sortOrder}` : " ASC";

    const [rows] = await pool.query(query, queryParams);
    return rows;
  }

  // Find game by ID
  static async findById(gameId) {
    const [rows] = await pool.query("SELECT * FROM games WHERE id = ?", [
      gameId,
    ]);
    return rows[0];
  }

  // Update game information
  static async update(gameId, updateData) {
    const { name, platform_id, age_rating, synopsis, poster_url } = updateData;

    const [result] = await pool.query(
      `UPDATE games 
      SET name = ?, platform = ?, age_rating = ?, 
      synopsis = ?, poster_url = ? 
      WHERE id = ?`,
      [name, platform_id, age_rating, synopsis, poster_url, gameId]
    );

    return result.affectedRows > 0;
  }

  // Delete a game
  static async delete(gameId) {
    const [result] = await pool.query("DELETE FROM games WHERE id = ?", [
      gameId,
    ]);

    return result.affectedRows > 0;
  }

  // Advanced search with multiple criteria
  static async advancedSearch(searchCriteria) {
    let query = "SELECT * FROM games WHERE 1=1";
    const queryParams = [];

    // Multiple search criteria
    if (searchCriteria.name) {
      query += " AND name LIKE ?";
      queryParams.push(`%${searchCriteria.name}%`);
    }

    if (searchCriteria.platform) {
      query += " AND platform = ?";
      queryParams.push(searchCriteria.platform);
    }

    if (searchCriteria.minYear) {
      query += " AND release_year >= ?";
      queryParams.push(searchCriteria.minYear);
    }

    const [rows] = await pool.query(query, queryParams);
    return rows;
  }
}

module.exports = Game;
