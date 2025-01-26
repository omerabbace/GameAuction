const PlatformModel = require("../models/PlatformModel");

class PlatformController {
  static async getAllPlatforms(req, res) {
    try {
      const platforms = await PlatformModel.getAllPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createPlatform(req, res) {
    try {
      const { name } = req.body;
      const platformId = await PlatformModel.createPlatform(name);
      res
        .status(201)
        .json({ id: platformId, message: "Platform created successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updatePlatform(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      await PlatformModel.updatePlatform(id, name);
      res.json({ message: "Platform updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async deletePlatform(req, res) {
    try {
      const { id } = req.params;
      await PlatformModel.deletePlatform(id);
      res.json({ message: "Platform deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PlatformController;
