const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route to place a new bid (requires authentication)
// router.post("/", authMiddleware.verifyToken, bidController.createBid);

// Route to get bids for a specific auction
router.get("/:auctionId", bidController.getAuctionBids);

module.exports = router;
