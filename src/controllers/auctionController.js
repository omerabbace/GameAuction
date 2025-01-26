// src/controllers/auctionController.js
const Auction = require("../models/Auction");
const { pool } = require("../../config/database");
const Bid = require("../models/Bid");
const { ValidationError } = require("../middlewares/errorHandler");
const path = require("path");
const fs = require("fs");

class AuctionController {
  // Create a new auction
  static async createAuction(req, res, next) {
    // Initialize file path to null
    let filePath = null;

    try {
      // Log the entire request body and file for debugging
      // console.log("Request Body:", req.body);
      // console.log("Request File:", req.file);

      const { game_id, start_price, end_date, platform } = req.body;

      // Validate input
      if (!game_id || !start_price || !end_date) {
        throw new ValidationError(
          "Game ID, start price, and end date are required"
        );
      }

      // Prepare poster path (if uploaded)
      let posterPath = null;
      if (req.file) {
        // Correct template literal syntax
        posterPath = `/uploads/posters/${req.file.filename}`;

        // Store the actual file path for potential deletion
        filePath = path.join(__dirname, "../../public", posterPath);

        // Log the poster path
        // console.log("Poster path:", posterPath);
        // console.log("Full file path:", filePath);
      }

      // Prepare auction data
      const auctionData = {
        game_id: game_id.toString(), // Ensure string
        user_id: req.user.id,
        start_price: parseFloat(start_price),
        end_date: new Date(end_date),
        platform_id: platform || null,
        poster: posterPath, // Set poster path
      };

      // Log auction data before creation

      // Create auction
      const auctionId = await Auction.create(auctionData);

      res.status(201).json({
        message: "Auction created successfully",
        auctionId,
        poster: posterPath,
      });
    } catch (error) {
      // Log the full error

      // Delete uploaded file if it exists and there's an error
      if (filePath) {
        try {
          await fs.unlink(filePath);
          console.log("Successfully deleted file:", filePath);
        } catch (unlinkError) {
          console.error("Failed to delete file:", {
            filePath,
            error: unlinkError,
          });
        }
      }

      // Pass error to global error handler
      next(error);
    }
  }

  // Get all active auctions
  static async getActiveAuctions(req, res, next) {
    try {
      const { platform, game_name, sortBy, sortOrder } = req.query;

      // console.log(platform_id, game_name, sortBy, sortOrder);
      const auctions = await Auction.findActiveAuctions({
        platform,
        game_name,
        sortBy,
        sortOrder,
      });

      res.json({
        total: auctions.length,
        auctions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single auction details
  static async getAuctionDetails(req, res, next) {
    try {
      const auctionId = req.params.id;
      const auction = await Auction.findById(auctionId);

      if (!auction) {
        throw new ValidationError("Auction not found");
      }

      // Get top bids
      const topBids = await Bid.getTopBids(auctionId, 5);

      res.json({
        ...auction,
        topBids,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bids for a specific auction
  static async getBidHistory(req, res, next) {
    try {
      const auctionId = req.params.id;
      console.log("auc", auctionId);

      const [bids] = await pool.query(
        `SELECT * FROM bids WHERE auction_id= ${auctionId}`,

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

  // static async getUser(req, res, next) {
  //   const userId = req.params.id;
  //   console.log("user IId", userId);
  //   try {
  //     const [users] = await pool.query(
  //       `SELECT username FROM users WHERE id=${userId}`,
  //       // `SELECT b.*, u.username
  //       //          FROM bids b
  //       //          JOIN users u ON b.user_id = u.id
  //       //          WHERE b.auction_id = ?
  //       //          ORDER BY b.amount DESC`,
  //       [userId]
  //     );

  //     res.json({
  //       total: users.length,
  //       users,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async getUser(req, res, next) {
    const userId = req.params.id;
    console.log("user Id", userId);
    try {
      const [users] = await pool.query(
        "SELECT id, username AS name FROM users WHERE id = ?",
        [userId]
      );

      // If no user found
      if (users.length === 0) {
        return res.status(404).json({
          message: "User not found",
          total: 0,
          users: [],
        });
      }

      res.json({
        ...users[0], // Spread the first user object
        total: users.length,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      next(error);
    }
  }

  // Place a bid
  static async placeBid(req, res, next) {
    try {
      const auctionId = req.params.id;
      const { bid_amount } = req.body;

      console.log(auctionId);

      // Validate bid
      const auction = await Auction.findById(auctionId);

      if (!auction) {
        throw new ValidationError("Auction not found");
      }

      if (auction.status !== "active") {
        throw new ValidationError("This auction is not active");
      }

      // if (bid_amount <= auction.current_price) {
      //   throw new ValidationError("Bid must be higher than current price");
      // }

      // Place bid
      const bidId = await Bid.create({
        auction_id: auctionId,
        // src/controllers/auctionController.js (continued)
        user_id: req.user.id,
        bid_amount,
      });

      // Update auction current price
      // await Auction.updateCurrentPrice(auctionId, bid_amount);

      res.status(201).json({
        message: "Bid placed successfully",
        bidId,
      });
    } catch (error) {
      next(error);
    }
  }

  // User's auction history
  static async getUserAuctions(req, res, next) {
    try {
      const userId = req.user.id;
      const auctions = await Auction.findUserAuctions(userId);

      res.json({
        total: auctions.length,
        auctions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Advanced auction search
  static async searchAuctions(req, res, next) {
    try {
      const searchCriteria = {
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        platform: req.query.platform,
      };

      const auctions = await Auction.advancedSearch(searchCriteria);

      res.json({
        total: auctions.length,
        auctions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Close expired auctions (can be used as a scheduled task)
  static async closeExpiredAuctions(req, res, next) {
    try {
      const closedCount = await Auction.closeExpiredAuctions();

      res.json({
        message: `Closed ${closedCount} expired auctions`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuctionController;
