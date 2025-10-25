const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
], authController.register);

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], authController.login);

// Get user profile
router.get('/profile', authController.authenticateToken, authController.getProfile);

// Update user preferences
router.put('/preferences', authController.authenticateToken, authController.updatePreferences);

module.exports = router;