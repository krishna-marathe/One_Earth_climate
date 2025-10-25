const express = require('express');
const insightController = require('../controllers/insightController');
const authController = require('../controllers/authController');

const router = express.Router();

// Get AI-generated insights
router.post('/generate', authController.authenticateToken, insightController.generateInsights);

// Get policy recommendations
router.get('/policy', authController.authenticateToken, insightController.getPolicyRecommendations);

// Chat with AI about climate data
router.post('/chat', authController.authenticateToken, insightController.chatWithAI);

// Get insight history
router.get('/history', authController.authenticateToken, insightController.getInsightHistory);

module.exports = router;