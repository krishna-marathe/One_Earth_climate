const axios = require('axios');

// Mock AI insights - in production, integrate with OpenAI or Gemini API
const generateMockInsight = (data) => {
  const insights = [
    "Based on current temperature trends, we're observing a 15% increase in heatwave probability over the next decade.",
    "Rainfall patterns suggest a shift towards more extreme weather events, with 23% higher flood risk in coastal regions.",
    "CO₂ levels are accelerating beyond projected rates, indicating urgent need for emission reduction strategies.",
    "Drought conditions are expanding geographically, affecting 12% more agricultural areas than previous models predicted.",
    "Sea level rise is occurring 8% faster than IPCC projections, requiring immediate coastal adaptation measures.",
    "Deforestation rates correlate strongly with regional temperature increases, showing 0.3°C rise per 10% forest loss."
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
};

// Generate AI insights based on climate data
exports.generateInsights = async (req, res) => {
  try {
    const { temperature, co2_level, rainfall, predictions } = req.body;
    
    // In production, this would call OpenAI/Gemini API
    // const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
    //   model: 'gpt-3.5-turbo',
    //   messages: [{
    //     role: 'user',
    //     content: `Analyze this climate data and provide insights: Temperature: ${temperature}°C, CO2: ${co2_level}ppm, Rainfall: ${rainfall}mm. Predictions: ${JSON.stringify(predictions)}`
    //   }]
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // });

    // Mock AI-generated insights
    const insights = {
      summary: generateMockInsight({ temperature, co2_level, rainfall }),
      key_findings: [
        "Temperature anomalies detected in the provided dataset",
        "CO₂ levels exceed safe thresholds for climate stability",
        "Precipitation patterns show irregular distribution",
        "Risk models indicate elevated probability for extreme events"
      ],
      recommendations: [
        "Implement immediate carbon reduction strategies",
        "Enhance early warning systems for extreme weather",
        "Invest in climate-resilient infrastructure",
        "Develop regional adaptation plans"
      ],
      confidence_score: 0.87,
      generated_at: new Date().toISOString()
    };

    res.json(insights);
  } catch (error) {
    console.error('Insight generation error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};

// Get policy recommendations
exports.getPolicyRecommendations = async (req, res) => {
  try {
    const { region, risk_level } = req.query;
    
    const policyRecommendations = {
      region: region || 'global',
      risk_level: risk_level || 'medium',
      recommendations: [
        {
          category: 'Mitigation',
          priority: 'High',
          actions: [
            'Implement carbon pricing mechanisms',
            'Transition to renewable energy sources',
            'Enhance energy efficiency standards',
            'Promote sustainable transportation'
          ]
        },
        {
          category: 'Adaptation',
          priority: 'High',
          actions: [
            'Develop climate-resilient infrastructure',
            'Implement early warning systems',
            'Create climate adaptation funds',
            'Enhance disaster preparedness'
          ]
        },
        {
          category: 'Research & Development',
          priority: 'Medium',
          actions: [
            'Invest in climate technology research',
            'Support green innovation initiatives',
            'Develop climate monitoring systems',
            'Enhance climate modeling capabilities'
          ]
        }
      ],
      timeline: '2024-2030',
      estimated_impact: 'Potential 30-40% reduction in climate risks',
      generated_at: new Date().toISOString()
    };

    res.json(policyRecommendations);
  } catch (error) {
    console.error('Policy recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch policy recommendations' });
  }
};

// Chat with AI about climate data
exports.chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Mock AI chat response
    const responses = [
      "Based on the climate data you've shared, I can see concerning trends in temperature and precipitation patterns.",
      "The correlation between CO₂ levels and temperature anomalies is particularly noteworthy in your dataset.",
      "Your question about flood risk is very relevant - the models show increased probability in the coming years.",
      "The scenario you're describing aligns with IPCC projections for this region and timeframe.",
      "That's an excellent observation about the relationship between deforestation and local climate changes.",
      "The data suggests we need to focus on both mitigation and adaptation strategies for this region."
    ];

    const aiResponse = {
      message: responses[Math.floor(Math.random() * responses.length)],
      context_understood: true,
      suggestions: [
        "Would you like me to analyze specific risk factors?",
        "I can provide more detailed predictions for your region",
        "Shall we explore mitigation strategies for these risks?"
      ],
      timestamp: new Date().toISOString()
    };

    res.json(aiResponse);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

// Get insight history for user
exports.getInsightHistory = async (req, res) => {
  try {
    // Mock insight history - in production, fetch from database
    const history = [
      {
        id: 1,
        type: 'risk_analysis',
        summary: 'Flood risk assessment for coastal regions',
        generated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        confidence: 0.89
      },
      {
        id: 2,
        type: 'trend_analysis',
        summary: 'Temperature trend analysis for the past decade',
        generated_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        confidence: 0.92
      },
      {
        id: 3,
        type: 'scenario_simulation',
        summary: 'Impact assessment of 50% renewable energy adoption',
        generated_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        confidence: 0.85
      }
    ];

    res.json({
      history,
      total_insights: history.length,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Insight history error:', error);
    res.status(500).json({ error: 'Failed to fetch insight history' });
  }
};