// src/models/Bid.js
const { pool } = require('../../config/database');

class Bid {
  // Create a new bid
  static async create(bidData) {
    const { 
      auction_id, 
      user_id, 
      bid_amount 
    } = bidData;

    const [result] = await pool.query(
      `INSERT INTO bids 
      (auction_id, user_id, bid_amount) 
      VALUES (?, ?, ?)`,
      [auction_id, user_id, bid_amount]
    );

    return result.insertId;
  }

  // Get top bids for an auction
  static async getTopBids(auctionId, limit = 5) {
    const [rows] = await pool.query(
      `SELECT b.*, u.username 
       FROM bids b
       JOIN users u ON b.user_id = u.id
       WHERE b.auction_id = ?
       ORDER BY b.bid_amount DESC
       LIMIT ?`, 
      [auctionId, limit]
    );
    return rows;
  }

  // Get user's bid history
  static async getUserBids(userId) {
    const [rows] = await pool.query(
      `SELECT b.*, a.game_id, g.name as game_name, a.status as auction_status
       FROM bids b
       JOIN auctions a ON b.auction_id = a.id
       JOIN games g ON a.game_id = g.id
       WHERE b.user_id = ?
       ORDER BY b.bid_time DESC`, 
      [userId]
    );
    return rows;
  }

  // Get winning bid for a completed auction
  static async getWinningBid(auctionId) {
    const [rows] = await pool.query(
      `SELECT * 
       FROM bids 
       WHERE auction_id = ?
       ORDER BY bid_amount DESC
       LIMIT 1`, 
      [auctionId]
    );
    return rows[0];
  }

  // Get bid count for an auction
  static async getBidCount(auctionId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as bid_count
       FROM bids 
       WHERE auction_id = ?`, 
      [auctionId]
    );
    return rows[0].bid_count;
  }
}

module.exports = Bid;