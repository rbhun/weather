# Weather Model Comparison Dashboard

A comprehensive weather dashboard that compares multiple weather models with automatic update functionality.

## Features

- **Multi-Model Weather Comparison**: Compare forecasts from 8 different weather models
- **Real-time Data**: Fetches live weather data from Open-Meteo API
- **Interactive Charts**: Beautiful, responsive charts using Chart.js
- **Server-Side Location Storage**: Locations are saved on the server and shared across all users
- **Geocoding Search**: Search for locations by name with autocomplete suggestions
- **Auto-Update System**: Automatically checks for and applies updates from GitHub releases
- **PWA Support**: Can be installed as a Progressive Web App
- **Offline Capability**: Service worker caches resources for offline use

## Weather Models

The dashboard compares forecasts from these weather models:
- **DWD ICON Seamless** - German Weather Service (DWD)
- **ECMWF IFS025** - European Centre for Medium-Range Weather Forecasts
- **GFS GraphCast025** - NOAA Global Forecast System
- **MeteoFrance Arpege** - French Weather Service (Global)
- **MeteoFrance Seamless** - French Weather Service (Seamless)
- **MetNo Seamless** - Norwegian Meteorological Institute
- **GFS Seamless** - NOAA Global Forecast System (Seamless)
- **GEM Seamless** - Environment Canada Global Environmental Multiscale Model
- **UK MET Office Seamless** - UK Meteorological Office

## Server-Side Location Storage

The dashboard now includes server-side location management:

### Features
- **Shared Locations**: All users see the same location list
- **Persistent Storage**: Locations are saved in `locations.json` on the server
- **REST API**: Full CRUD operations for location management
- **Geocoding Integration**: Search locations by name with autocomplete

### API Endpoints
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Add new location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location
- `GET /api/health` - Health check

### Running the Server
```bash
# Install dependencies
npm install

# Start the server
node server.js

# Or use the deployment script
./deploy.sh
```

The server will be available at `http://localhost:3000`

## Auto-Update System

The application includes an advanced auto-update system that:

1. **Checks for Updates**: Automatically checks GitHub releases every 24 hours
2. **Downloads Updates**: Downloads new files from GitHub releases
3. **Applies Updates**: Seamlessly applies updates without page reload
4. **User Notifications**: Shows update notifications with progress indicators

### Setting Up Auto-Updates

To enable auto-updates, you need to:

1. **Update GitHub Repository**: Modify the `GITHUB_REPO` constant in `script.js`:
   ```javascript
   const GITHUB_REPO = 'your-username/your-repo-name';
   ```

2. **Create GitHub Releases**: When you want to release an update:
   - Create a new release on GitHub
   - Tag it with a version (e.g., `v1.0.1`)
   - Upload the updated files as release assets:
     - `script.js`
     - `styles.css`
     - `index.html`
     - `sw.js` (if updated)

3. **Version Management**: Update the `CURRENT_VERSION` constant in `script.js` to match your release version.

### How Auto-Updates Work

1. **Check Process**: The app checks GitHub API for the latest release
2. **Version Comparison**: Compares current version with latest release version
3. **Download**: Downloads new files from the release assets
4. **Apply**: Replaces old files with new ones in the browser
5. **Cache Update**: Updates service worker cache with new files

## Installation

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/weather.git
   cd weather
   ```

2. Serve the files using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

### Production Deployment

1. Upload all files to your web server
2. Ensure HTTPS is enabled (required for service workers)
3. Update the GitHub repository configuration in `script.js`

## Configuration

### API Configuration

The app uses the Open-Meteo API. Update the API key in `script.js`:
```javascript
const API_KEY = 'your-api-key-here';
```

### Update Configuration

Modify these constants in `script.js`:
```javascript
const GITHUB_REPO = 'your-username/your-repo-name';
const CURRENT_VERSION = '1.0.0';
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
```

## File Structure

```
weather/
├── index.html          # Main application file
├── script.js           # Application logic and auto-update system
├── styles.css          # Application styles
├── sw.js              # Service worker for caching and updates
├── manifest.json       # PWA manifest
├── README.md          # This file
└── .gitignore         # Git ignore file
```

## Browser Support

- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

## Service Worker

The service worker (`sw.js`) provides:
- **Caching**: Caches app resources for offline use
- **Update Management**: Handles file updates and cache invalidation
- **Background Sync**: Enables background update checks

## Troubleshooting

### Auto-Update Issues

1. **Check GitHub Repository**: Ensure the repository URL is correct
2. **Verify Releases**: Make sure releases are properly tagged
3. **Check Console**: Look for error messages in browser console
4. **Clear Cache**: Clear browser cache if updates aren't applying

### API Issues

1. **Check API Key**: Verify your Open-Meteo API key is valid
2. **Rate Limits**: Check if you've exceeded API rate limits
3. **Network**: Ensure internet connection is stable

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### Version 1.0.0
- Initial release with weather model comparison
- Auto-update system implementation
- PWA support
- Service worker for offline functionality 