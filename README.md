# Weather Model Comparison Dashboard

A modern, interactive web application that compares weather forecasts from 6 different weather models using the Open-Meteo API.

## Features

- **Multi-Model Comparison**: Displays weather data from 6 different weather models:
  - GFS (Global Forecast System)
  - ICON (Icosahedral Nonhydrostatic)
  - ECMWF (European Centre for Medium-Range Weather Forecasts)
  - GEM (Global Environmental Multiscale)
  - JMA (Japan Meteorological Agency)
  - METEOFRANCE

- **Weather Variables**: Shows 4 key weather parameters:
  - Temperature (°C)
  - Precipitation (mm)
  - Precipitation Probability (%)
  - Cloud Cover (%)

- **7-Day Forecast**: Displays hourly data for the next 7 days

- **Interactive Charts**: Beautiful, responsive charts using Chart.js with:
  - Hover tooltips showing exact values
  - Smooth animations
  - Color-coded model lines
  - Responsive design

- **Location Selection**: Currently includes Origo Studios in Hungary (easily expandable)

## How to Use

1. **Open the Application**: Simply open `index.html` in your web browser
2. **Select Location**: Choose from the dropdown menu (currently Origo Studios, Hungary)
3. **View Charts**: The dashboard will automatically load and display 4 charts:
   - Temperature comparison across all models
   - Precipitation amounts
   - Precipitation probability
   - Cloud cover percentage
4. **Compare Models**: Each line on the charts represents a different weather model
5. **Refresh Data**: Click the "Refresh Data" button to reload current weather data

## Technical Details

### API Integration
- Uses Open-Meteo API (https://open-meteo.com/)
- API Key: YrVIS5JatcuWWbN5
- Fetches hourly data for 7 days
- Supports multiple weather models in a single request

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Async/await for API calls, Chart.js for visualizations
- **Chart.js**: Professional chart library for data visualization

### Data Processing
- Fetches data for all 6 models simultaneously
- Processes and normalizes data for consistent display
- Handles timezone conversion automatically
- Provides error handling for API failures

## File Structure

```
weather/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript logic and API integration
└── README.md          # This file
```

## Adding New Locations

To add more locations, edit the `locationSelect` element in `index.html`:

```html
<select id="locationSelect">
    <option value="47.4979,19.0402">Origo Studios, Hungary</option>
    <option value="40.7128,-74.0060">New York, USA</option>
    <option value="51.5074,-0.1278">London, UK</option>
</select>
```

The format is `latitude,longitude` for the value attribute.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Features

- Lazy loading of chart data
- Efficient API calls with Promise.all()
- Responsive design for mobile devices
- Smooth animations and transitions
- Error handling and loading states

## Future Enhancements

- Add more locations
- Include additional weather variables (wind, humidity, etc.)
- Add data export functionality
- Implement historical data comparison
- Add weather alerts and notifications

## License

This project is open source and available under the MIT License. 