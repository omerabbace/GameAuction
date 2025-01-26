// src/controllers/gameController.js
const Game = require("../models/Game");
const { ValidationError } = require("../middlewares/errorHandler");

class GameController {
  // Create a new game
  static async createGame(req, res, next) {
    console.log(req.body);
    try {
      // Validate input
      const { name, platform_id, age_rating, synopsis, poster_url } = req.body;

      // Input validation
      if (!name || !platform_id) {
        throw new ValidationError("Name and platform are required");
      }

      // Create game
      const gameId = await Game.create({
        name,
        platform: platform_id,
        age_rating,
        synopsis,
        poster_url,
      });

      res.status(201).json({
        message: "Game created successfully",
        gameId,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // Get all games
  static async getAllGames(req, res, next) {
    try {
      // Extract query parameters for filtering
      const { platform, name, sortBy, sortOrder } = req.query;

      const games = await Game.findAll({
        platform,
        name,
        sortBy,
        sortOrder,
      });

      res.json({
        total: games.length,
        games,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single game by ID
  static async getGameById(req, res, next) {
    try {
      const gameId = req.params.id;

      const game = await Game.findById(gameId);

      if (!game) {
        throw new ValidationError("Game not found");
      }

      res.json(game);
    } catch (error) {
      next(error);
    }
  }

  // Update game
  static async updateGame(req, res, next) {
    try {
      const gameId = req.params.id;
      const updateData = req.body;

      // Validate input
      if (!updateData.name || !updateData.platform_id) {
        throw new ValidationError("Name and platform are required");
      }

      const updated = await Game.update(gameId, updateData);

      if (!updated) {
        throw new ValidationError("Game not found or no changes made");
      }

      res.json({
        message: "Game updated successfully",
        gameId,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // Delete game
  static async deleteGame(req, res, next) {
    try {
      const gameId = req.params.id;
      const deleted = await Game.delete(gameId);

      if (!deleted) {
        throw new ValidationError("Game not found");
      }

      res.json({
        message: "Game deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Advanced game search
  static async searchGames(req, res, next) {
    try {
      const searchCriteria = req.query;
      const games = await Game.advancedSearch(searchCriteria);

      res.json({
        total: games.length,
        games,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GameController;
