const express = require("express");
const router = express.Router();
const PlatformController = require("../controllers/PlatformController");
//const AdminController = require('../controllers/adminController');

// Platforms routes (protected by admin authentication)
router.get("/", PlatformController.getAllPlatforms);
router.post("/", PlatformController.createPlatform);
router.put("/:id", PlatformController.updatePlatform);
router.delete("/:id", PlatformController.deletePlatform);

module.exports = router;
