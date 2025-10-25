# ClimateSphere – AI-Powered Predictive Climate Analytics & Insight Platform

A comprehensive web application for climate risk analysis, prediction, and insights using machine learning and real-time data visualization.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
```

2. **ML API Setup**
```bash
cd backend/ml
pip install flask scikit-learn pandas numpy joblib xgboost
```

3. **Environment Variables**
Create `.env` in backend directory:
```
MONGODB_URI=mongodb://localhost:27017/climatesphere
FLASK_API_URL=http://localhost:5000
OPENAI_API_KEY=your_openai_key_here
JWT_SECRET=your_jwt_secret_here
```

### Running the Application

1. **Start MongoDB** (if running locally)
2. **Start ML API**
```bash
cd backend/ml
python prediction_api.py
```

3. **Start Backend**
```bash
cd backend
npm run dev
```

4. **Open Frontend**
Open `frontend/index.html` in your browser or serve with a local server.

## 📁 Project Structure

```
ClimateSphere/
├── backend/          # Node.js + Express API
├── frontend/         # HTML/CSS/JS client
├── database/         # MongoDB schemas
├── docs/            # Documentation
└── README.md
```

## 🌟 Features

- Real-time climate data visualization
- ML-powered risk predictions
- Interactive scenario simulations
- AI-generated insights
- Multi-modal climate analysis
- Responsive dashboard interface

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Chart.js, D3.js, Leaflet.js
- **Backend**: Node.js, Express.js, MongoDB
- **ML**: Python, Flask, Scikit-learn, XGBoost
- **Deployment**: Vercel, Render, MongoDB Atlas