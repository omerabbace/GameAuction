const { pool } = require("../../config/database");

class PlatformModel {
  static async getAllPlatforms() {
    const [rows] = await pool.query("SELECT * FROM platforms");
    return rows;
  }

  static async createPlatform(name) {
    const [result] = await pool.query(
      "INSERT INTO platforms (name) VALUES (?)",
      [name]
    );
    return result.insertId;
  }

  static async updatePlatform(id, name) {
    await pool.query("UPDATE platforms SET name = ? WHERE id = ?", [name, id]);
  }

  static async deletePlatform(id) {
    await pool.query("DELETE FROM platforms WHERE id = ?", [id]);
  }
}

module.exports = PlatformModel;
