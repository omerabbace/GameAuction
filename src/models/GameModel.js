const { pool } = require("../../config/database");

class GameModel {
  static async getAllGames() {
    const [rows] = await pool.query(`
            SELECT games.*, platforms.name AS platform_name 
            FROM games 
            JOIN platforms ON games.platform_id = platforms.id
        `);
    return rows;
  }

  static async createGame(gameData) {
    const { name, platform_id, age_rating, synopsis } = gameData;
    const [result] = await pool.query(
      "INSERT INTO games (name, platform_id, age_rating, synopsis) VALUES (?, ?, ?, ?)",
      [name, platform_id, age_rating, synopsis]
    );
    return result.insertId;
  }

  static async updateGame(id, gameData) {
    const { name, platform_id, age_rating, synopsis } = gameData;
    await pool.query(
      "UPDATE games SET name = ?, platform_id = ?, age_rating = ?, synopsis = ? WHERE id = ?",
      [name, platform_id, age_rating, synopsis, id]
    );
  }

  static async deleteGame(id) {
    await pool.query("DELETE FROM games WHERE id = ?", [id]);
  }
}

module.exports = GameModel;
