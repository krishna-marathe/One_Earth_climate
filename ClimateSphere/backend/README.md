# ClimateSphere Backend

Node.js + Express backend with MongoDB integration and Flask ML API communication.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- Python (v3.8+) for ML API

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

4. **Start ML API**
```bash
cd ml
pip install flask scikit-learn pandas numpy joblib xgboost
python prediction_api.py
```

5. **Start Backend Server**
```bash
npm run dev
```

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── config/
│   └── db.js              # Database configuration
├── models/
│   └── User.js            # User model
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── uploadRoutes.js    # File upload routes
│   ├── analysisRoutes.js  # Data analysis routes
│   ├── predictionRoutes.js # ML prediction routes
│   └── insightRoutes.js   # AI insights routes
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── uploadController.js # Upload logic
│   ├── analysisController.js # Analysis logic
│   ├── predictionController.js # Prediction logic
│   └── insightController.js # Insights logic
├── ml/
│   ├── prediction_api.py  # Flask ML API
│   └── model_verification.py # Model training/verification
└── utils/
    └── fileCleaner.js     # Data preprocessing
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/preferences` - Update preferences

### Data Upload
- `POST /api/upload/dataset` - Upload climate dataset
- `GET /api/upload/history` - Get upload history
- `DELETE /api/upload/:uploadId` - Delete upload

### Analysis
- `GET /api/analysis/trends` - Get climate trends
- `POST /api/analysis/dataset` - Analyze dataset
- `GET /api/analysis/correlation` - Get correlations
- `GET /api/analysis/regional/:region` - Regional analysis

### Predictions
- `POST /api/prediction/risk` - Get risk predictions
- `POST /api/prediction/future` - Future predictions
- `POST /api/prediction/scenario` - Scenario simulation
- `GET /api/prediction/metrics` - Model metrics

### AI Insights
- `POST /api/insights/generate` - Generate insights
- `GET /api/insights/policy` - Policy recommendations
- `POST /api/insights/chat` - Chat with AI
- `GET /api/insights/history` - Insight history

## 🤖 ML Integration

The backend communicates with a Flask-based ML API that provides:
- Climate risk predictions (flood, drought, heatwave)
- Future climate projections
- Scenario simulations
- Model performance metrics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet security headers
- File upload restrictions

## 📊 Data Processing

- Automatic data cleaning and preprocessing
- Support for CSV and Excel files
- Statistical analysis and trend detection
- Data validation and error handling

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
Make sure to set all required environment variables in production:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong JWT secret key
- `FLASK_API_URL` - ML API endpoint
- `OPENAI_API_KEY` - OpenAI API key (optional)

## 🧪 Testing

```bash
npm test
```

## 📝 License

MIT License