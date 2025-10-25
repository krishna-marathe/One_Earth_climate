# ClimateSphere Frontend

A complete, production-ready frontend for the ClimateSphere climate intelligence platform featuring authentication, interactive dashboards, and AI-powered predictions.

## 🚀 Quick Start

### Running Locally

1. **Start HTTP Server** (from `frontend/` directory):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if http-server installed)
   npx http-server -p 8000
   ```

2. **Access the Application**:
   - **Landing Page**: http://localhost:8000/landing/index.html
   - **Login**: http://localhost:8000/auth/login.html
   - **Dashboard**: http://localhost:8000/dashboard/dashboard.html
   - **Predictions**: http://localhost:8000/dashboard/predictions.html

## 📁 Project Structure

```
frontend/
├── landing/                    # Landing page with interactive map
│   ├── index.html             # Main landing page
│   ├── assets/
│   │   ├── css/style.css      # Landing page styles
│   │   └── js/main.js         # Interactive map & functionality
│   └── README.md              # Landing page documentation
│
├── auth/                      # Authentication pages
│   ├── login.html             # Login page
│   ├── signup.html            # Registration page
│   └── assets/
│       ├── css/auth.css       # Authentication styles
│       └── js/auth.js         # Login/signup functionality
│
├── dashboard/                 # Main dashboard application
│   ├── dashboard.html         # Main dashboard
│   ├── predictions.html       # Predictions & scenario simulator
│   ├── upload.html           # Data upload page
│   └── assets/
│       ├── css/dashboard.css  # Dashboard styles
│       └── js/dashboard.js    # Dashboard functionality
│
└── shared/                    # Shared components and utilities
    └── assets/
        ├── css/common.css     # Common styles and variables
        └── js/
            ├── api.js         # API communication with fallbacks
            └── utils.js       # Utility functions
```

## 🔧 Configuration

### API Keys

Add your API keys to the configuration objects in the respective files:

**Landing Page** (`landing/assets/js/main.js`):
```javascript
const API_KEYS = {
    OPENWEATHER: 'your_openweather_api_key',
    AQICN: 'your_aqicn_api_key', 
    CO2: 'your_co2signal_api_key',
    MAPBOX_TOKEN: 'your_mapbox_token' // Optional
};
```

**API Module** (`shared/assets/js/api.js`):
```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api', // Your backend URL
    TIMEOUT: 10000,
    DEMO_MODE: false // Set to true to force demo mode
};
```

### Getting API Keys

1. **OpenWeatherMap**: https://openweathermap.org/api/
2. **Air Quality**: https://aqicn.org/api/
3. **CO2 Signal**: https://co2signal.com
4. **Mapbox** (Optional): https://mapbox.com

## 🎯 Features

### Landing Page
- **Interactive World Map** with climate data layers
- **Real-time Statistics** (CO2, Temperature, Flood Zones, Alerts)
- **Region Details Drawer** with charts and alerts
- **Responsive Design** (mobile-first, 320px+)
- **API Integration** with graceful fallbacks

### Authentication
- **Login/Signup Pages** with validation
- **Demo Mode** for testing without backend
- **Token-based Authentication** with localStorage
- **Password Strength Indicator**
- **Social Login Placeholders**

### Dashboard
- **Protected Routes** with authentication checks
- **Multi-section Navigation** (Overview, Upload, Analysis, Predictions, etc.)
- **File Upload** with drag-and-drop support
- **Region Filtering** via query parameters
- **Real-time Data Updates**

### Predictions
- **Scenario Simulator** with interactive sliders
- **Climate Predictions** using AI models or client-side fallbacks
- **Interactive Charts** with Chart.js
- **Data Export** (JSON/CSV downloads)
- **Risk Assessment** (Flood, Drought, Heatwave)

## 🔄 Demo Mode

The application works fully without a backend using comprehensive demo data:

- **Automatic Fallback**: APIs gracefully fall back to demo data
- **Demo Authentication**: Use any email/password (8+ chars) to login
- **Sample Data**: Includes realistic climate data for testing
- **Full Functionality**: All features work with simulated data

### Testing Demo Mode

1. **Landing Page**: Open and interact with map markers
2. **Authentication**: Login with `demo@test.com` / `password123`
3. **Dashboard**: Navigate between sections, upload files
4. **Predictions**: Run simulations and download results

## 🧪 Testing

### Manual Testing Checklist

1. **Landing Page**:
   - [ ] Map loads and displays markers
   - [ ] Clicking markers opens region drawer
   - [ ] "Open Region Dashboard" navigates with query params
   - [ ] Login/Signup buttons work

2. **Authentication**:
   - [ ] Form validation works (invalid email, short password)
   - [ ] Demo login succeeds and redirects to dashboard
   - [ ] Token stored in localStorage
   - [ ] Protected routes redirect to login when not authenticated

3. **Dashboard**:
   - [ ] Sidebar navigation switches sections
   - [ ] Query parameters filter region data
   - [ ] File upload shows progress and completion
   - [ ] Logout clears storage and redirects

4. **Predictions**:
   - [ ] Sliders update values in real-time
   - [ ] "Run Simulation" generates charts
   - [ ] "Download Prediction" creates JSON file
   - [ ] Risk assessments update based on scenarios

### Automated Testing

Run the built-in smoke tests by adding `?test=true` to any page URL:

- **Landing**: `http://localhost:8000/landing/index.html?test=true`
- **Dashboard**: `http://localhost:8000/dashboard/dashboard.html?test=true`

Check browser console for test results.

## 🔗 Integration

### Backend Integration

The frontend expects these API endpoints:

```
POST /api/auth/login          # User authentication
POST /api/auth/signup         # User registration
GET  /api/summary             # Dashboard statistics
POST /api/upload              # File upload
POST /api/predict             # Climate predictions
POST /api/scenario/save       # Save prediction scenarios
```

### Query Parameters

- **Dashboard**: `?country=USA&region=California` - Filter for specific region
- **Demo Mode**: `?demo=true` - Force demo mode access

### Local Storage

- `cs_token`: Authentication token
- `cs_user`: User profile data (JSON)
- `cs_last_scenario`: Last saved prediction scenario

## 🎨 Customization

### Styling

All styles use CSS custom properties defined in `shared/assets/css/common.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #10b981;
    --danger-color: #ef4444;
    /* ... */
}
```

### Adding New Sections

1. Add navigation item to `dashboard.html` sidebar
2. Create content section with `id="newsection-section"`
3. Add navigation handler in `dashboard.js`
4. Implement section-specific functionality

### Map Customization

Edit `landing/assets/js/main.js`:

- **Tile Provider**: Change `tileLayer` configuration
- **Markers**: Modify `displayRegionMarkers()` function
- **Layers**: Add new climate data layers in `layerGroups`

## 🚨 Troubleshooting

### Common Issues

1. **Map Not Loading**:
   - Check browser console for errors
   - Verify internet connection for tile loading
   - Ensure Leaflet.js CDN is accessible

2. **Authentication Not Working**:
   - Check if `cs_token` is in localStorage
   - Verify API endpoints are correct
   - Try demo mode with `?demo=true`

3. **Buttons Not Responding**:
   - Check console for JavaScript errors
   - Verify all script files are loading
   - Ensure proper script loading order

4. **Styles Not Applied**:
   - Check CSS file paths are correct
   - Verify common.css loads before page-specific CSS
   - Clear browser cache

### Debug Mode

Enable debug logging:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

### Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Required Features**: ES6+, CSS Grid, Flexbox, Fetch API

## 📱 Mobile Support

- **Responsive Design**: Works on all screen sizes (320px+)
- **Touch Interactions**: Optimized for mobile devices
- **Collapsible Navigation**: Sidebar becomes overlay on mobile
- **Swipe Gestures**: Drawer interactions work with touch

## 🔒 Security

- **XSS Protection**: All user inputs are sanitized
- **CSRF Prevention**: Token-based authentication
- **Secure Storage**: Sensitive data in localStorage only
- **Input Validation**: Client-side and server-side validation

## 📊 Performance

- **Lazy Loading**: Map tiles and data loaded on demand
- **Caching**: API responses cached to reduce requests
- **Optimization**: Minified libraries from CDN
- **Compression**: Gzip-friendly code structure

## 🤝 Contributing

1. **Code Style**: Follow existing patterns and conventions
2. **Testing**: Test all functionality before submitting
3. **Documentation**: Update README for new features
4. **Accessibility**: Ensure WCAG 2.1 AA compliance

## 📄 License

Part of the ClimateSphere project. See main project license for details.