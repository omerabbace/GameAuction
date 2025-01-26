// src/models/Auction.js
const { pool } = require("../../config/database");

// class Auction {
//   // Create a new auction

//   static async create(auctionData) {
//     const { game_id, user_id, start_price, end_date } = auctionData;

//     const [result] = await pool.query(
//       `INSERT INTO auctions
//       (game_id, user_id, start_price, current_price, start_date, end_date, status)
//       VALUES (?, ?, ?, ?, NOW(), ?, 'active')`,
//       [game_id, user_id, start_price, start_price, end_date]
//     );

//     return result.insertId;
//   }

class Auction {
  static async create(auctionData) {
    // Comprehensive validation
    const requiredFields = ["game_id", "user_id", "start_price", "end_date"];

    // Check for missing or invalid fields
    requiredFields.forEach((field) => {
      if (!auctionData[field]) {
        throw new Error(`${field} is required for auction creation`);
      }
    });

    const query = `
      INSERT INTO auctions 
      (game_id, user_id, start_price, current_price, end_date, platform_id, poster, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ensure all values are properly defined
    const values = [
      auctionData.game_id,
      auctionData.user_id,
      auctionData.start_price,
      auctionData.start_price, // Initial current price
      auctionData.end_date,
      auctionData.platform_id,
      auctionData.poster,
      "active",
    ];

    try {
      // Log values before execution
      console.log("Auction Creation Values:", values);

      const [result] = await pool.execute(query, values);

      console.log("Auction created successfully:", {
        auctionId: result.insertId,
        poster: auctionData.poster,
      });

      return result.insertId;
    } catch (error) {
      // Detailed error logging
      console.error("Auction Creation Database Error:", {
        error: error.message,
        stack: error.stack,
        auctionData: auctionData,
      });
      throw error;
    }
  }
  // Get all active auctions
  static async findActiveAuctions(criteria) {
    let query = `
      SELECT *, poster AS poster_path 
      FROM auctions 
      WHERE status = 'active'
    `;
    const queryParams = [];

    // Add filtering conditions
    if (criteria.platform) {
      query += " AND platform = ?";
      queryParams.push(criteria.platform);
    }

    if (criteria.game_name) {
      query += " AND game_id LIKE ?";
      queryParams.push(`%${criteria.game_name}%`);
    }

    // Add sorting
    if (criteria.sortBy) {
      query += ` ORDER BY ${criteria.sortBy} ${criteria.sortOrder || "ASC"}`;
    }

    try {
      const [results] = await database.execute(query, queryParams);
      return results;
    } catch (error) {
      console.error("Error finding active auctions:", error);
      throw error;
    }
  }

  // Find auction by ID with detailed information
  static async findById(auctionId) {
    const [rows] = await pool.query(
      `SELECT * FROM auctions
      WHERE id = ? `,
      // `SELECT a.*, g.name as game_name, g.platform, g.poster_url,
      //         (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count,
      //         (SELECT MAX(bid_amount) FROM bids WHERE auction_id = a.id) as highest_bid
      //  FROM auctions a
      //  JOIN games g ON a.game_id = g.id
      //  WHERE a.id = ?`,
      [auctionId]
    );
    return rows[0];
  }

  // Update auction status
  static async updateStatus(auctionId, status) {
    const [result] = await pool.query(
      "UPDATE auctions SET status = ? WHERE id = ?",
      [status, auctionId]
    );

    return result.affectedRows > 0;
  }

  // Close expired auctions
  static async closeExpiredAuctions() {
    const [result] = await pool.query(
      `UPDATE auctions
       SET status = 'completed'
       WHERE status = 'active' AND end_date < NOW()`
    );

    return result.affectedRows;
  }

  // Get user's auctions
  static async findUserAuctions(userId) {
    const [rows] = await pool.query(
      // `SELECT a.*, g.name as game_name, g.platform
      //  FROM auctions a
      //  JOIN games g ON a.game_id = g.id
      //  WHERE a.user_id = ?
      //  ORDER BY a.start_date DESC`,
      `SELECT *
      FROM auctions `,
      [userId]
    );
    return rows;
  }

  // Advanced auction search
  static async advancedSearch(searchCriteria) {
    let query = `
      SELECT a.*, g.name as game_name, g.platform
      FROM auctions a
      JOIN games g ON a.game_id = g.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (searchCriteria.min_price) {
      query += " AND a.current_price >= ?";
      queryParams.push(searchCriteria.min_price);
    }

    if (searchCriteria.max_price) {
      query += " AND a.current_price <= ?";
      queryParams.push(searchCriteria.max_price);
    }

    if (searchCriteria.platform) {
      query += " AND g.platform = ?";
      queryParams.push(searchCriteria.platform);
    }

    const [rows] = await pool.query(query, queryParams);
    return rows;
  }
}

module.exports = Auction;
