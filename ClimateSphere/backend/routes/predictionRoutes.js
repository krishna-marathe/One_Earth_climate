const express = require('express');
const predictionController = require('../controllers/predictionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Get risk predictions
router.post('/risk', authController.authenticateToken, predictionController.getRiskPredictions);

// Get future climate predictions
router.post('/future', authController.authenticateToken, predictionController.getFuturePredictions);

// Run scenario simulation
router.post('/scenario', authController.authenticateToken, predictionController.runScenarioSimulation);

// Get model performance metrics
router.get('/metrics', authController.authenticateToken, predictionController.getModelMetrics);

module.exports = router;