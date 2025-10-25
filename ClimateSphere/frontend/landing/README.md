# ClimateSphere Landing Page

A production-ready, interactive landing page for the ClimateSphere climate intelligence platform featuring real-time climate data visualization, interactive maps, and AI-powered insights.

## Features

- **Interactive World Map**: Leaflet.js-powered map with multiple climate data layers
- **Real-time Data Integration**: Live climate data from multiple APIs with graceful fallbacks
- **Responsive Design**: Mobile-first design that works on all devices (320px+)
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Climate Data Layers**: Temperature, Air Quality, Rainfall, Snow, Cyclones, Water Stress
- **Region Details**: Click any region for detailed climate information and trends
- **Live Statistics**: Global CO2 levels, temperature averages, and alert counts

## Quick Start

### Local Development

1. **Simple File Server** (Recommended):
   ```bash
   # Navigate to the landing directory
   cd frontend/landing
   
   # Start a local server (Python 3)
   python -m http.server 8080
   
   # Or using Python 2
   python -m SimpleHTTPServer 8080
   
   # Or using Node.js (if you have http-server installed)
   npx http-server -p 8080
   ```

2. **Direct File Access**:
   - Simply open `index.html` in your browser
   - Note: Some features may be limited due to CORS restrictions

3. **Access the page**:
   - Open http://localhost:8080 in your browser
   - The page will load with fallback data initially

## API Configuration

### Adding API Keys

Edit the `API_KEYS` object in `assets/js/main.js`:

```javascript
const API_KEYS = {
    OPENWEATHER: 'your_openweather_api_key',     // Get from https://openweathermap.org/api/
    AQICN: 'your_aqicn_api_key',                 // Get from https://aqicn.org/api/
    CO2: 'your_co2signal_api_key',               // Get from https://co2signal.com
    MAPBOX_TOKEN: 'your_mapbox_token'            // Optional: Get from https://mapbox.com
};
```

### API Key Setup Instructions

1. **OpenWeatherMap** (Temperature & Weather):
   - Sign up at https://openweathermap.org/api/
   - Get your free API key
   - Add to `OPENWEATHER` field

2. **Air Quality (AQICN)**:
   - Register at https://aqicn.org/api/
   - Get your API token
   - Add to `AQICN` field

3. **CO2 Signal**:
   - Sign up at https://co2signal.com
   - Get your API key
   - Add to `CO2` field

4. **Mapbox** (Optional - Better Map Tiles):
   - Create account at https://mapbox.com
   - Get your access token
   - Add to `MAPBOX_TOKEN` field
   - If not provided, falls back to OpenStreetMap tiles

### Fallback Behavior

The application gracefully handles missing API keys:
- **No API Keys**: Uses comprehensive fallback data for all features
- **Partial Keys**: Uses available APIs and falls back for missing ones
- **API Failures**: Automatically switches to fallback data on errors
- **CORS Issues**: Handles cross-origin restrictions gracefully

## Customization

### Map Tile Provider

To change the map tiles, edit the tile layer configuration in `assets/js/main.js`:

```javascript
// Current implementation auto-selects based on MAPBOX_TOKEN
const tileLayer = API_KEYS.MAPBOX_TOKEN 
    ? L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${API_KEYS.MAPBOX_TOKEN}`)
    : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

// Alternative providers:
// Satellite: mapbox/satellite-v9
// Streets: mapbox/streets-v11
// Dark: mapbox/dark-v10
// Light: mapbox/light-v10
```

### Adding Custom Regions

Add new regions to the `FALLBACK_DATA.regions` array in `main.js`:

```javascript
{
    country: 'Country Name',
    region: 'Region Name',
    lat: latitude,
    lon: longitude,
    temp: temperature_celsius,
    aqi: air_quality_index,
    rainfall: rainfall_mm_24h,
    co2: co2_ppm,
    alerts: [
        { type: 'alert_type', level: 'severity', message: 'Alert message' }
    ]
}
```

### Styling Customization

Key CSS variables in `assets/css/style.css`:

```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --secondary-color: #10b981;    /* Secondary accent */
    --danger-color: #ef4444;       /* High risk/alerts */
    --warning-color: #f97316;      /* Medium risk */
    --success-color: #22c55e;      /* Low risk/safe */
}
```

## Architecture

### File Structure
```
frontend/landing/
├── index.html              # Main HTML structure
├── assets/
│   ├── css/
│   │   └── style.css       # All styles and responsive design
│   └── js/
│       └── main.js         # Core functionality and API integration
└── README.md              # This file
```

### Key Components

1. **Map Integration** (`initializeMap()`):
   - Leaflet.js with marker clustering
   - Multiple overlay layers
   - Interactive region selection

2. **Data Pipeline** (`loadGlobalData()`, `fetchRegionData()`):
   - API data fetching with error handling
   - Data normalization and caching
   - Fallback data management

3. **Region Details** (`openRegionDetails()`):
   - Sliding drawer interface
   - Real-time charts with Chart.js
   - Alert system with severity levels

4. **Responsive Design**:
   - Mobile-first CSS Grid and Flexbox
   - Breakpoints: 768px (tablet), 480px (mobile)
   - Touch-friendly interactions

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Features**: ES6+, CSS Grid, Flexbox, Fetch API

## Performance

- **Lazy Loading**: Map tiles and data loaded on demand
- **Clustering**: Marker clustering for performance with many points
- **Caching**: API responses cached to reduce requests
- **Optimization**: Minified libraries loaded from CDN

## Accessibility

- **WCAG 2.1 AA Compliant**
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets accessibility contrast requirements
- **Focus Management**: Clear focus indicators and logical tab order

## Troubleshooting

### Common Issues

1. **Map Not Loading**:
   - Check browser console for errors
   - Verify internet connection
   - Try refreshing the page

2. **No Live Data**:
   - Check API keys are correctly set
   - Verify API key permissions and quotas
   - Check browser console for CORS errors

3. **Mobile Layout Issues**:
   - Ensure viewport meta tag is present
   - Check CSS media queries
   - Test on actual devices

4. **Performance Issues**:
   - Reduce number of map markers
   - Check for JavaScript errors
   - Monitor network requests

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

## Integration with ClimateSphere

This landing page integrates with the main ClimateSphere platform:

- **Navigation**: Links to `/dashboard.html`, `/predictions.html`
- **Region Dashboard**: Opens detailed region views
- **API Compatibility**: Uses same data formats as main platform
- **Styling**: Consistent with main platform design system

## Contributing

When modifying this landing page:

1. **Test Responsiveness**: Check all breakpoints (320px, 768px, 1200px+)
2. **Verify Accessibility**: Test keyboard navigation and screen readers
3. **API Fallbacks**: Ensure graceful degradation when APIs fail
4. **Performance**: Monitor bundle size and loading times
5. **Cross-browser**: Test in multiple browsers and devices

## License

Part of the ClimateSphere project. See main project license for details.