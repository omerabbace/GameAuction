const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController");

// Admin Login Route
router.post("/login", AdminController.login);

// Create Initial Admin (first-time setup)
router.post("/create", AdminController.createAdmin);

module.exports = router;
