// src/routes/userRoutes.js
const express = require('express');
const UserController = require('../controllers/userController');
const ValidationMiddleware = require('../middlewares/validationMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', 
  ValidationMiddleware.sanitizeInput,
  ValidationMiddleware.validateRegistration,
  UserController.register
);

router.post('/login', 
  ValidationMiddleware.sanitizeInput,
  UserController.login
);

router.post('/refresh-token', 
  UserController.refreshToken
);

// Protected Routes
router.get('/profile', 
  authMiddleware, 
  UserController.getProfile
);

router.put('/profile', 
  authMiddleware,
  ValidationMiddleware.sanitizeInput, 
  UserController.updateProfile
);

router.post('/logout', 
  authMiddleware, 
  UserController.logout
);

module.exports = router;
