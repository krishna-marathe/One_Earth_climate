const axios = require('axios');

// Google AI API configuration
const GOOGLE_AI_API_KEY = 'AIzaSyD4UTx8zFi3uox4-7NjyBUBNNph1otVF9g';
const GOOGLE_AI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Specialized knowledge base for different user types
const KNOWLEDGE_BASE = {
  farmer: {
    crops: {
      maize: {
        drought_tips: [
          "Switch to drought-resistant maize varieties like DK-8031 or Pioneer 30G40",
          "Implement drip irrigation to reduce water usage by 40-60%",
          "Apply mulching to retain soil moisture",
          "Consider intercropping with legumes to improve soil health",
          "Use soil moisture sensors for precise irrigation timing"
        ],
        flood_tips: [
          "Ensure proper drainage channels around fields",
          "Plant on raised beds to prevent waterlogging",
          "Choose flood-tolerant varieties if available",
          "Harvest early if flooding is predicted",
          "Apply fungicides post-flood to prevent diseases"
        ]
      },
      rice: {
        drought_tips: [
          "Use System of Rice Intensification (SRI) method",
          "Plant drought-tolerant varieties like Sahbhagi Dhan",
          "Implement alternate wetting and drying (AWD)",
          "Use direct seeding instead of transplanting"
        ],
        flood_tips: [
          "Choose submergence-tolerant varieties like Swarna-Sub1",
          "Ensure proper bund maintenance",
          "Install early warning systems for flood alerts"
        ]
      }
    },
    general_advice: {
      drought: [
        "Monitor soil moisture levels regularly",
        "Implement rainwater harvesting systems",
        "Use cover crops to prevent soil erosion",
        "Consider crop insurance for risk management",
        "Diversify crops to reduce risk"
      ],
      flood: [
        "Create emergency evacuation plans for livestock",
        "Store seeds and fertilizers in elevated areas",
        "Maintain drainage systems regularly",
        "Keep emergency contact numbers handy"
      ]
    }
  },
  disaster_response: {
    flood_response: [
      "Activate early warning systems immediately",
      "Deploy emergency response teams to high-risk areas",
      "Coordinate with local authorities for evacuation plans",
      "Set up temporary shelters and relief camps",
      "Ensure medical teams are on standby",
      "Monitor water levels and weather forecasts continuously"
    ],
    drought_response: [
      "Implement water rationing in affected areas",
      "Deploy water tankers to drought-hit regions",
      "Coordinate with agricultural departments for crop support",
      "Set up cattle camps for livestock protection",
      "Monitor groundwater levels and reservoir status"
    ],
    heatwave_response: [
      "Issue heat wave warnings through all media channels",
      "Set up cooling centers in urban areas",
      "Ensure hospitals are prepared for heat-related illnesses",
      "Advise outdoor work restrictions during peak hours",
      "Monitor vulnerable populations (elderly, children)"
    ]
  }
};

// Enhanced AI chat with Google Gemini integration
const callGoogleAI = async (prompt, context = {}) => {
  try {
    const response = await axios.post(`${GOOGLE_AI_URL}?key=${GOOGLE_AI_API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Google AI API error:', error.response?.data || error.message);
    return null;
  }
};

// Analyze user query to determine user type and intent
const analyzeUserQuery = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Detect user type
  let userType = 'general';
  if (lowerMessage.includes('crop') || lowerMessage.includes('farm') || lowerMessage.includes('harvest') || 
      lowerMessage.includes('irrigation') || lowerMessage.includes('soil') || lowerMessage.includes('seed')) {
    userType = 'farmer';
  } else if (lowerMessage.includes('district') || lowerMessage.includes('emergency') || 
             lowerMessage.includes('response') || lowerMessage.includes('evacuation') || 
             lowerMessage.includes('disaster') || lowerMessage.includes('team')) {
    userType = 'disaster_response';
  }

  // Detect risk type
  let riskType = null;
  if (lowerMessage.includes('drought') || lowerMessage.includes('dry') || lowerMessage.includes('water shortage') || 
      (lowerMessage.includes('low') && lowerMessage.includes('rain'))) {
    riskType = 'drought';
  } else if (lowerMessage.includes('flood') || lowerMessage.includes('flooding') || 
             (lowerMessage.includes('water') && !lowerMessage.includes('low'))) {
    riskType = 'flood';
  } else if (lowerMessage.includes('heat') || lowerMessage.includes('temperature') || lowerMessage.includes('hot')) {
    riskType = 'heatwave';
  }

  // Detect crop type for farmers
  let cropType = null;
  if (userType === 'farmer') {
    if (lowerMessage.includes('maize') || lowerMessage.includes('corn')) {
      cropType = 'maize';
    } else if (lowerMessage.includes('rice') || lowerMessage.includes('paddy')) {
      cropType = 'rice';
    }
  }

  return { userType, riskType, cropType };
};

// Generate specialized response based on user type and query
const generateSpecializedResponse = async (message, analysis) => {
  const { userType, riskType, cropType } = analysis;
  
  let specializedAdvice = [];
  let responseContext = '';

  if (userType === 'farmer' && riskType && cropType) {
    // Specific crop and risk advice
    const cropAdvice = KNOWLEDGE_BASE.farmer.crops[cropType];
    if (cropAdvice && cropAdvice[`${riskType}_tips`]) {
      specializedAdvice = cropAdvice[`${riskType}_tips`];
      responseContext = `For ${cropType} farming during ${riskType} conditions`;
    }
  } else if (userType === 'farmer' && riskType) {
    // General farming advice for risk type
    const generalAdvice = KNOWLEDGE_BASE.farmer.general_advice[riskType];
    if (generalAdvice) {
      specializedAdvice = generalAdvice;
      responseContext = `General farming advice for ${riskType} conditions`;
    }
  } else if (userType === 'disaster_response' && riskType) {
    // Disaster response advice
    const responseAdvice = KNOWLEDGE_BASE.disaster_response[`${riskType}_response`];
    if (responseAdvice) {
      specializedAdvice = responseAdvice;
      responseContext = `Disaster response protocol for ${riskType} events`;
    }
  }

  return { specializedAdvice, responseContext };
};

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

// Enhanced chat with AI about climate data
exports.chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Analyze user query to understand intent and user type
    const analysis = analyzeUserQuery(message);
    const { userType, riskType, cropType } = analysis;

    // Generate specialized response
    const { specializedAdvice, responseContext } = await generateSpecializedResponse(message, analysis);

    // Create enhanced prompt for Google AI
    let aiPrompt = `You are ClimateSphere AI, an expert climate advisor. 
    
User Query: "${message}"
User Type: ${userType}
Risk Type: ${riskType || 'general'}
${cropType ? `Crop Type: ${cropType}` : ''}
${responseContext ? `Context: ${responseContext}` : ''}

Please provide a SHORT, actionable response (2-3  specific and practical.`;

    if (specializedAdvice.length > 0) {
      aiPrompt += `\n\nSpecialized recommendations to consider:\n${specializedAdvice.map(advice => `- ${advice}`).join('\n')}`;
    }

    // Call Google AI API
    let aiMessage = await callGoogleAI(aiPrompt, context);
    
    // Fallback to specialized response if AI call fails
    if (!aiMessage && specializedAdvice.length > 0) {
      aiMessage = `Based on your query about ${riskType} affecting ${cropType || 'your situation'}, here are my recommendations:\n\n${specializedAdvice.map((advice, index) => `${index + 1}. ${advice}`).join('\n\n')}`;
    } else if (!aiMessage) {
      // Ultimate fallback
      const fallbackResponses = {
        farmer: "I understand you're facing agricultural challenges. Let me help you with climate-smart farming solutions. Could you provide more details about your specific crop and the weather conditions you're experiencing?",
        disaster_response: "I can assist with disaster response planning and risk assessment. Please specify the type of climate risk (flood, drought, heatwave) and the affected region for targeted recommendations.",
        general: "I'm here to help with climate-related questions. Could you provide more specific details about the climate risks or conditions you're concerned about?"
      };
      aiMessage = fallbackResponses[userType] || fallbackResponses.general;
    }

    // Generate contextual suggestions
    let suggestions = [];
    if (userType === 'farmer') {
      suggestions = [
        "Would you like crop-specific recommendations?",
        "I can provide irrigation scheduling advice",
        "Shall we discuss alternative crops for your region?",
        "Would you like soil management tips?"
      ];
    } else if (userType === 'disaster_response') {
      suggestions = [
        "Would you like risk assessment for specific districts?",
        "I can provide emergency response protocols",
        "Shall we discuss early warning systems?",
        "Would you like evacuation planning guidance?"
      ];
    } else {
      suggestions = [
        "Would you like me to analyze specific risk factors?",
        "I can provide detailed predictions for your region",
        "Shall we explore mitigation strategies?",
        "Would you like to discuss adaptation measures?"
      ];
    }

    // Prepare response with risk predictions if applicable
    let riskPredictions = null;
    if (riskType) {
      // Mock risk prediction - in production, call ML API
      riskPredictions = {
        risk_type: riskType,
        probability: Math.random() * 0.4 + 0.3, // 30-70%
        severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        timeframe: '7-14 days',
        affected_areas: ['District A', 'District B', 'District C']
      };
    }

    const aiResponse = {
      message: aiMessage,
      user_type: userType,
      risk_type: riskType,
      crop_type: cropType,
      context_understood: true,
      specialized_advice: specializedAdvice.slice(0, 3), // Top 3 recommendations
      risk_predictions: riskPredictions,
      suggestions: suggestions.slice(0, 3), // Top 3 suggestions
      confidence_score: 0.85 + Math.random() * 0.1, // 85-95%
      timestamp: new Date().toISOString()
    };

    res.json(aiResponse);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

// Get district-wise risk assessment
exports.getDistrictRiskAssessment = async (req, res) => {
  try {
    const { risk_type, timeframe } = req.query;
    
    // Mock district risk data - in production, integrate with ML models
    const districts = [
      { name: 'Mumbai', state: 'Maharashtra', risk_level: 'High', probability: 0.78 },
      { name: 'Chennai', state: 'Tamil Nadu', risk_level: 'High', probability: 0.72 },
      { name: 'Kolkata', state: 'West Bengal', risk_level: 'Medium', probability: 0.55 },
      { name: 'Hyderabad', state: 'Telangana', risk_level: 'Medium', probability: 0.48 },
      { name: 'Bangalore', state: 'Karnataka', risk_level: 'Low', probability: 0.32 },
      { name: 'Pune', state: 'Maharashtra', risk_level: 'Medium', probability: 0.51 },
      { name: 'Ahmedabad', state: 'Gujarat', risk_level: 'High', probability: 0.69 },
      { name: 'Jaipur', state: 'Rajasthan', risk_level: 'Low', probability: 0.28 }
    ];

    // Filter and sort by risk level
    const riskAssessment = districts
      .map(district => ({
        ...district,
        risk_type: risk_type || 'flood',
        timeframe: timeframe || '7 days',
        recommendations: generateDistrictRecommendations(district.risk_level, risk_type)
      }))
      .sort((a, b) => b.probability - a.probability);

    res.json({
      risk_type: risk_type || 'flood',
      timeframe: timeframe || '7 days',
      total_districts: riskAssessment.length,
      high_risk_count: riskAssessment.filter(d => d.risk_level === 'High').length,
      districts: riskAssessment,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('District risk assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch district risk assessment' });
  }
};

// Generate recommendations for districts based on risk level
const generateDistrictRecommendations = (riskLevel, riskType) => {
  const recommendations = {
    flood: {
      High: [
        'Activate emergency response teams immediately',
        'Issue evacuation warnings for low-lying areas',
        'Deploy rescue boats and equipment',
        'Set up temporary shelters'
      ],
      Medium: [
        'Monitor water levels closely',
        'Prepare emergency response teams',
        'Issue advisory to residents',
        'Check drainage systems'
      ],
      Low: [
        'Continue routine monitoring',
        'Maintain emergency preparedness',
        'Regular system checks'
      ]
    },
    drought: {
      High: [
        'Implement water rationing immediately',
        'Deploy water tankers',
        'Set up cattle camps',
        'Provide agricultural support'
      ],
      Medium: [
        'Monitor water reserves',
        'Prepare contingency plans',
        'Issue water conservation advisories'
      ],
      Low: [
        'Continue monitoring',
        'Promote water conservation'
      ]
    },
    heatwave: {
      High: [
        'Issue heat wave warnings',
        'Set up cooling centers',
        'Restrict outdoor activities',
        'Alert medical facilities'
      ],
      Medium: [
        'Monitor temperature trends',
        'Issue health advisories',
        'Prepare cooling centers'
      ],
      Low: [
        'Continue monitoring',
        'General health precautions'
      ]
    }
  };

  return recommendations[riskType]?.[riskLevel] || recommendations.flood[riskLevel];
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