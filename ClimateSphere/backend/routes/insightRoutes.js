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

// Get district-wise risk assessment
router.get('/districts', authController.authenticateToken, insightController.getDistrictRiskAssessment);

// Demo endpoints (no authentication required)
router.post('/demo/chat', insightController.chatWithAI);
router.get('/demo/districts', insightController.getDistrictRiskAssessment);
router.post('/demo/generate', insightController.generateInsights);

module.exports = router;