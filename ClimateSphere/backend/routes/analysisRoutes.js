const express = require('express');
const analysisController = require('../controllers/analysisController');
const authController = require('../controllers/authController');

const router = express.Router();

// Get climate trends analysis
router.get('/trends', authController.authenticateToken, analysisController.getClimatetrends);

// Analyze uploaded dataset
router.post('/dataset', authController.authenticateToken, analysisController.analyzeDataset);

// Get correlation analysis
router.get('/correlation', authController.authenticateToken, analysisController.getCorrelationAnalysis);

// Get regional analysis
router.get('/regional/:region', authController.authenticateToken, analysisController.getRegionalAnalysis);

module.exports = router;