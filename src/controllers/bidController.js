const { pool } = require("../../config/database");
const { ValidationError } = require("../middlewares/errorHandler");

class BidController {
  constructor() {
    // Bind methods to ensure correct context
    this.createBid = this.createBid.bind(this);
    this.getAuctionBids = this.getAuctionBids.bind(this);
  }

  // Create a new bid
  static async createBid(req, res, next) {
    try {
      const { auctionId, amount } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!auctionId || !amount) {
        throw new ValidationError("Auction ID and bid amount are required");
      }

      // Validate bid amount and auction
      const [auction] = await pool
        // .promise()
        .query('SELECT * FROM auctions WHERE id = ? AND status = "ACTIVE"', [
          auctionId,
        ]);

      if (auction.length === 0) {
        throw new ValidationError("Auction not found or not active");
      }

      const [currentHighestBidResult] = await pool
        // .promise()
        .query("SELECT MAX(amount) as max_bid FROM bids WHERE auction_id = ?", [
          auctionId,
        ]);

      const maxBidAmount =
        currentHighestBidResult[0].max_bid || auction[0].starting_price;

      if (amount <= maxBidAmount) {
        throw new ValidationError(
          "Bid amount must be higher than current highest bid"
        );
      }

      // Insert new bid
      const [result] = await pool
        // .promise()
        .query(
          "INSERT INTO bids (user_id, auction_id, amount, timestamp) VALUES (?, ?, ?, NOW())",
          [userId, auctionId, amount]
        );

      res.status(201).json({
        message: "Bid placed successfully",
        bidId: result.insertId,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bids for a specific auction
  static async getAuctionBids(req, res, next) {
    try {
      const { auctionId } = req.params;

      const [bids] = await pool.query(
        `SELECT * FROM auctions WHERE id = ${auctionId}`,
        // `SELECT b.*, u.username
        //          FROM bids b
        //          JOIN users u ON b.user_id = u.id
        //          WHERE b.auction_id = ?
        //          ORDER BY b.amount DESC`,
        [auctionId]
      );

      res.json({
        total: bids.length,
        bids,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export an instance with bound methods
module.exports = BidController;
