// src/routes/gameRoutes.js
const express = require("express");
const GameController = require("../controllers/gameController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/", GameController.getAllGames);
router.get("/search", GameController.searchGames);
router.get("/:id", GameController.getGameById);

// Protected Routes (Admin Only)
router.post(
  "/",
  authMiddleware,

  GameController.createGame
);

router.put("/:id", authMiddleware, GameController.updateGame);

router.delete(
  "/:id",
  authMiddleware,

  GameController.deleteGame
);

module.exports = router;
