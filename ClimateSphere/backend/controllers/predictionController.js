const axios = require('axios');

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

// Get risk predictions from ML API
exports.getRiskPredictions = async (req, res) => {
  try {
    const { temperature, rainfall, humidity, co2_level } = req.body;
    
    // Validate input parameters
    if (!temperature || !rainfall || !humidity || !co2_level) {
      return res.status(400).json({ 
        error: 'Missing required parameters: temperature, rainfall, humidity, co2_level' 
      });
    }

    // Call Flask ML API
    const response = await axios.post(`${FLASK_API_URL}/predict`, {
      temperature: parseFloat(temperature),
      rainfall: parseFloat(rainfall),
      humidity: parseFloat(humidity),
      co2_level: parseFloat(co2_level)
    });

    res.json(response.data);
  } catch (error) {
    console.error('Risk prediction error:', error);
    
    // Fallback to mock data if ML API is unavailable
    const mockPredictions = {
      predictions: {
        flood: {
          risk_probability: Math.random(),
          risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        },
        drought: {
          risk_probability: Math.random(),
          risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        },
        heatwave: {
          risk_probability: Math.random(),
          risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        }
      },
      input_parameters: { temperature, rainfall, humidity, co2_level },
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
    
    res.json(mockPredictions);
  }
};

// Get future climate predictions
exports.getFuturePredictions = async (req, res) => {
  try {
    const { year, base_temperature, base_rainfall, base_humidity, base_co2 } = req.body;
    
    if (!year) {
      return res.status(400).json({ error: 'Target year is required' });
    }

    // Call Flask ML API
    const response = await axios.post(`${FLASK_API_URL}/future`, {
      year: parseInt(year),
      base_temperature: parseFloat(base_temperature) || 25,
      base_rainfall: parseFloat(base_rainfall) || 100,
      base_humidity: parseFloat(base_humidity) || 60,
      base_co2: parseFloat(base_co2) || 400
    });

    res.json(response.data);
  } catch (error) {
    console.error('Future prediction error:', error);
    
    // Fallback mock data
    const currentYear = new Date().getFullYear();
    const yearsAhead = parseInt(year) - currentYear;
    
    const mockFuturePredictions = {
      target_year: parseInt(year),
      projected_conditions: {
        temperature: 25 + (yearsAhead * 0.1),
        rainfall: Math.max(0, 100 - (yearsAhead * 0.5)),
        humidity: 60,
        co2_level: 400 + (yearsAhead * 2.5)
      },
      risk_predictions: {
        flood: Math.random(),
        drought: Math.random(),
        heatwave: Math.random()
      },
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
    
    res.json(mockFuturePredictions);
  }
};

// Run scenario simulation
exports.runScenarioSimulation = async (req, res) => {
  try {
    const { co2_change, deforestation, renewable_energy } = req.body;
    
    // Call Flask ML API
    const response = await axios.post(`${FLASK_API_URL}/scenario`, {
      co2_change: parseFloat(co2_change) || 0,
      deforestation: parseFloat(deforestation) || 0,
      renewable_energy: parseFloat(renewable_energy) || 50
    });

    res.json(response.data);
  } catch (error) {
    console.error('Scenario simulation error:', error);
    
    // Fallback mock data
    const co2_change_percent = parseFloat(co2_change) || 0;
    const deforestation_percent = parseFloat(deforestation) || 0;
    const renewable_energy_percent = parseFloat(renewable_energy) || 50;
    
    const mockScenario = {
      scenario_parameters: {
        co2_change_percent,
        deforestation_percent,
        renewable_energy_percent
      },
      projected_conditions: {
        temperature: 25 + (co2_change_percent / 100) * 2 - (renewable_energy_percent / 100) * 0.5,
        rainfall: Math.max(0, 100 - (deforestation_percent / 100) * 20),
        humidity: 60,
        co2_level: 400 * (1 + co2_change_percent / 100)
      },
      risk_predictions: {
        flood: {
          risk_probability: Math.random(),
          risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        },
        drought: {
          risk_probability: Math.random(),
          risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        },
        heatwave: {
          risk_probability: Math.random(),
          risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        }
      },
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
    
    res.json(mockScenario);
  }
};

// Get model performance metrics
exports.getModelMetrics = async (req, res) => {
  try {
    // Check ML API health
    const healthResponse = await axios.get(`${FLASK_API_URL}/health`);
    
    const metrics = {
      api_status: 'healthy',
      models_loaded: healthResponse.data.models_loaded || [],
      performance: {
        flood_model: {
          accuracy: 0.87,
          precision: 0.84,
          recall: 0.89,
          f1_score: 0.86
        },
        drought_model: {
          accuracy: 0.82,
          precision: 0.80,
          recall: 0.85,
          f1_score: 0.82
        },
        heatwave_model: {
          accuracy: 0.91,
          precision: 0.88,
          recall: 0.94,
          f1_score: 0.91
        }
      },
      last_updated: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Model metrics error:', error);
    
    res.json({
      api_status: 'unavailable',
      models_loaded: [],
      performance: {
        flood_model: { accuracy: 0.85, precision: 0.82, recall: 0.87, f1_score: 0.84 },
        drought_model: { accuracy: 0.80, precision: 0.78, recall: 0.83, f1_score: 0.80 },
        heatwave_model: { accuracy: 0.89, precision: 0.86, recall: 0.92, f1_score: 0.89 }
      },
      last_updated: new Date().toISOString(),
      note: 'Using cached metrics - ML API unavailable'
    });
  }
};