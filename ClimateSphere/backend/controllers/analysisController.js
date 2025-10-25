const axios = require('axios');

// Get climate trends analysis
exports.getClimatetrends = async (req, res) => {
  try {
    // Mock climate trends data - in production, this would come from real APIs
    const trends = {
      temperature: {
        current: 25.4,
        change: +1.2,
        trend: 'increasing',
        data: generateTrendData('temperature', 12)
      },
      co2: {
        current: 421.3,
        change: +2.8,
        trend: 'increasing',
        data: generateTrendData('co2', 12)
      },
      rainfall: {
        current: 98.7,
        change: -5.2,
        trend: 'decreasing',
        data: generateTrendData('rainfall', 12)
      },
      seaLevel: {
        current: 3.4,
        change: +0.3,
        trend: 'increasing',
        data: generateTrendData('seaLevel', 12)
      }
    };

    res.json({
      trends,
      lastUpdated: new Date().toISOString(),
      region: req.query.region || 'global'
    });
  } catch (error) {
    console.error('Climate trends error:', error);
    res.status(500).json({ error: 'Failed to fetch climate trends' });
  }
};

// Analyze uploaded dataset
exports.analyzeDataset = async (req, res) => {
  try {
    const { data, columns } = req.body;
    
    if (!data || !columns) {
      return res.status(400).json({ error: 'Dataset data and columns required' });
    }

    // Perform basic statistical analysis
    const analysis = {
      summary: {
        totalRows: data.length,
        totalColumns: columns.length,
        dateRange: extractDateRange(data)
      },
      statistics: {},
      correlations: {},
      trends: {}
    };

    // Calculate statistics for numeric columns
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => !isNaN(parseFloat(val)));
      
      if (values.length > 0) {
        const numericValues = values.map(Number);
        analysis.statistics[col] = {
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          std: calculateStandardDeviation(numericValues)
        };

        // Simple trend analysis
        analysis.trends[col] = calculateTrend(numericValues);
      }
    });

    res.json(analysis);
  } catch (error) {
    console.error('Dataset analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze dataset' });
  }
};

// Get correlation analysis
exports.getCorrelationAnalysis = async (req, res) => {
  try {
    // Mock correlation data
    const correlations = {
      'temperature_co2': 0.87,
      'temperature_rainfall': -0.43,
      'co2_deforestation': 0.72,
      'rainfall_humidity': 0.65,
      'temperature_heatwaves': 0.91,
      'rainfall_floods': 0.78
    };

    res.json({
      correlations,
      interpretation: generateCorrelationInterpretation(correlations),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Correlation analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch correlation analysis' });
  }
};

// Get regional analysis
exports.getRegionalAnalysis = async (req, res) => {
  try {
    const { region } = req.params;
    
    // Mock regional data
    const regionalData = {
      region: region,
      climate: {
        avgTemperature: 25 + Math.random() * 10,
        avgRainfall: 100 + Math.random() * 50,
        avgHumidity: 60 + Math.random() * 20,
        co2Level: 400 + Math.random() * 50
      },
      risks: {
        flood: Math.random(),
        drought: Math.random(),
        heatwave: Math.random()
      },
      trends: {
        temperature: generateTrendData('temperature', 24),
        rainfall: generateTrendData('rainfall', 24)
      }
    };

    res.json(regionalData);
  } catch (error) {
    console.error('Regional analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch regional analysis' });
  }
};

// Helper functions
function generateTrendData(type, months) {
  const data = [];
  const baseValue = {
    temperature: 25,
    co2: 400,
    rainfall: 100,
    seaLevel: 3.0
  }[type];

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - i));
    
    let value = baseValue + (Math.random() - 0.5) * 10;
    if (type === 'temperature' || type === 'co2') {
      value += i * 0.1; // Slight upward trend
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
}

function extractDateRange(data) {
  // Try to find date columns
  const dateColumns = ['date', 'Date', 'DATE', 'timestamp', 'time'];
  let dateColumn = null;
  
  for (const col of dateColumns) {
    if (data[0] && data[0][col]) {
      dateColumn = col;
      break;
    }
  }
  
  if (!dateColumn) return null;
  
  const dates = data.map(row => new Date(row[dateColumn])).filter(date => !isNaN(date));
  if (dates.length === 0) return null;
  
  return {
    start: Math.min(...dates).toISOString().split('T')[0],
    end: Math.max(...dates).toISOString().split('T')[0]
  };
}

function calculateStandardDeviation(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

function calculateTrend(values) {
  if (values.length < 2) return 'insufficient_data';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (Math.abs(change) < 5) return 'stable';
  return change > 0 ? 'increasing' : 'decreasing';
}

function generateCorrelationInterpretation(correlations) {
  const interpretations = [];
  
  Object.entries(correlations).forEach(([pair, value]) => {
    const [var1, var2] = pair.split('_');
    let strength = 'weak';
    if (Math.abs(value) > 0.7) strength = 'strong';
    else if (Math.abs(value) > 0.4) strength = 'moderate';
    
    const direction = value > 0 ? 'positive' : 'negative';
    
    interpretations.push({
      variables: [var1, var2],
      correlation: value,
      strength,
      direction,
      description: `${strength} ${direction} correlation between ${var1} and ${var2}`
    });
  });
  
  return interpretations;
}