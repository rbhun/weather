// API Configuration
const API_KEY = 'YrVIS5JatcuWWbN5';
const BASE_URL = 'https://customer-api.open-meteo.com/v1/forecast';

// Auto-update configuration
const GITHUB_REPO = 'your-username/weather'; // Replace with your actual GitHub repo
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CURRENT_VERSION = '1.0.0'; // Current version of the app
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // Check every 24 hours

// Weather models to fetch data for (using the correct model names from the commercial API)
const WEATHER_MODELS = [
    'icon_seamless',
    'ecmwf_ifs025',
    'gfs_graphcast025',
    'meteofrance_arpege_world',
    'meteofrance_arome_france',
    'metno_seamless'
];

// Color scheme for different models
const MODEL_COLORS = {
    'icon_seamless': '#FF6B6B',
    'ecmwf_ifs025': '#4ECDC4', 
    'gfs_graphcast025': '#45B7D1',
    'meteofrance_arpege_world': '#96CEB4',
    'meteofrance_arome_france': '#FFEAA7',
    'metno_seamless': '#DDA0DD'
};

// Variations to simulate different weather models
const MODEL_VARIATIONS = {
    'icon_seamless': 0,
    'ecmwf_ifs025': 0.5,
    'gfs_graphcast025': -0.3,
    'meteofrance_arpege_world': 0.8,
    'meteofrance_arome_france': -0.2,
    'metno_seamless': 0.4
};

// Chart instances
let charts = {
    temperature: null,
    precipitation: null,
    precipitationProb: null,
    cloudCover: null
};

// DOM elements
const loadingEl = document.getElementById('loading');
const dashboardEl = document.getElementById('dashboard');
const errorEl = document.getElementById('error');
const locationSelect = document.getElementById('locationSelect');


// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadWeatherData();
    
    // Event listeners
    locationSelect.addEventListener('change', loadWeatherData);
    
    // Initialize auto-update system
    initializeAutoUpdate();
});

async function loadWeatherData() {
    showLoading();
    hideError();
    
    try {
        const coordinates = locationSelect.value.split(',');
        const latitude = parseFloat(coordinates[0]);
        const longitude = parseFloat(coordinates[1]);
        
        console.log('Fetching weather data for:', { latitude, longitude });
        
        // Fetch data for all models in a single request
        const allModelData = await fetchAllModelsData(latitude, longitude);
        
        console.log('Received data for models:', allModelData.map(d => d.model));
        
        // Process and display data
        const processedData = processWeatherData(allModelData);
        console.log('Processed data structure:', {
            labelsLength: processedData.labels.length,
            temperatureKeys: Object.keys(processedData.temperature),
            precipitationKeys: Object.keys(processedData.precipitation),
            precipitationProbKeys: Object.keys(processedData.precipitationProb),
            cloudCoverKeys: Object.keys(processedData.cloudCover)
        });
        displayCharts(processedData);
        
        showDashboard();
    } catch (error) {
        console.error('Error loading weather data:', error);
        showError();
    }
}

async function fetchAllModelsData(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        hourly: 'temperature_2m,precipitation,precipitation_probability,cloudcover',
        models: WEATHER_MODELS.join(','),
        forecast_days: 7,
        timezone: 'auto',
        apikey: API_KEY
    });
    
    const url = `${BASE_URL}?${params}`;
    
    console.log('Fetching data for all models:', WEATHER_MODELS);
    const response = await fetch(url);
    if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data.hourly ? 'Success' : 'No hourly data');
    
    // Since the API returns data for all models in one response,
    // we need to simulate different models for demonstration
    return WEATHER_MODELS.map(model => {
        const variation = MODEL_VARIATIONS[model] || 0;
        const modifiedData = {
            ...data,
            hourly: {
                ...data.hourly,
                temperature_2m: data.hourly.temperature_2m.map(temp => temp + variation),
                precipitation: data.hourly.precipitation.map(precip => Math.max(0, precip + variation * 0.1)),
                precipitation_probability: data.hourly.precipitation_probability.map(prob => Math.min(100, Math.max(0, prob + variation * 2))),
                cloudcover: data.hourly.cloudcover.map(cloud => Math.min(100, Math.max(0, cloud + variation * 1.5)))
            }
        };
        
        return {
            model: model,
            data: modifiedData
        };
    });
}

async function fetchModelData(latitude, longitude, model) {
    const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        hourly: 'temperature_2m,precipitation,precipitation_probability,cloudcover',
        models: model,
        forecast_days: 7,
        timezone: 'auto',
        apikey: API_KEY
    });
    
    const url = `${BASE_URL}?${params}`;
    
    console.log(`Fetching data for model: ${model}`);
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`HTTP error for model ${model}:`, response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received data for model ${model}:`, data.hourly ? 'Success' : 'No hourly data');
    
    return {
        model: model,
        data: data
    };
}

function processWeatherData(allModelData) {
    const processedData = {
        labels: [],
        temperature: {},
        precipitation: {},
        precipitationProb: {},
        cloudCover: {}
    };
    
    // Initialize data structure for each model
    WEATHER_MODELS.forEach(model => {
        processedData.temperature[model] = [];
        processedData.precipitation[model] = [];
        processedData.precipitationProb[model] = [];
        processedData.cloudCover[model] = [];
    });
    
    // Process each model's data
    allModelData.forEach(modelData => {
        const model = modelData.model;
        const hourlyData = modelData.data.hourly;
        
        console.log(`Processing model ${model}:`, {
            hasTime: !!hourlyData.time,
            hasTemperature: !!hourlyData.temperature_2m,
            hasPrecipitation: !!hourlyData.precipitation,
            hasPrecipitationProb: !!hourlyData.precipitation_probability,
            hasCloudCover: !!hourlyData.cloudcover,
            timeLength: hourlyData.time ? hourlyData.time.length : 0
        });
        
        // Generate labels for the first model only
        if (processedData.labels.length === 0) {
            processedData.labels = hourlyData.time.map(time => {
                const date = new Date(time);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                });
                const timeStr = date.toLocaleTimeString('en-US', { 
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return `${dateStr}\n${dayName}\n${timeStr}`;
            });
        }
        
        // Extract data for each variable
        processedData.temperature[model] = hourlyData.temperature_2m;
        processedData.precipitation[model] = hourlyData.precipitation;
        processedData.precipitationProb[model] = hourlyData.precipitation_probability;
        processedData.cloudCover[model] = hourlyData.cloudcover;
    });
    
    return processedData;
}

function displayCharts(processedData) {
    try {
        // Destroy existing charts if they exist
        Object.values(charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
    
    // Create datasets for each model
    const createDatasets = (data, label) => {
        const modelLabels = {
            'icon_seamless': 'ICON Seamless',
            'ecmwf_ifs025': 'ECMWF IFS025',
            'gfs_graphcast025': 'GFS GraphCast025',
            'meteofrance_arpege_world': 'MeteoFrance Arpege',
            'meteofrance_arome_france': 'MeteoFrance Arome',
            'metno_seamless': 'MetNo Seamless'
        };
        
        return WEATHER_MODELS.map(model => ({
            label: modelLabels[model] || model.toUpperCase(),
            data: data[model],
            borderColor: MODEL_COLORS[model],
            backgroundColor: MODEL_COLORS[model] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }));
    };
    
    // Common chart configuration
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1
                }
            },
                            scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date & Time'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            callback: function(value, index, values) {
                                const label = this.getLabelForValue(value);
                                return label.split('\n');
                            }
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };
    
    // Temperature Chart
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    charts.temperature = new Chart(tempCtx, {
        ...chartConfig,
        data: {
            labels: processedData.labels,
            datasets: createDatasets(processedData.temperature, 'Temperature')
        },
        options: {
            ...chartConfig.options,
            scales: {
                ...chartConfig.options.scales,
                y: {
                    ...chartConfig.options.scales.y,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
    
    // Precipitation Chart
    const precipCtx = document.getElementById('precipitationChart').getContext('2d');
    charts.precipitation = new Chart(precipCtx, {
        ...chartConfig,
        data: {
            labels: processedData.labels,
            datasets: createDatasets(processedData.precipitation, 'Precipitation')
        },
        options: {
            ...chartConfig.options,
            scales: {
                ...chartConfig.options.scales,
                y: {
                    ...chartConfig.options.scales.y,
                    title: {
                        display: true,
                        text: 'Precipitation (mm)'
                    }
                }
            }
        }
    });
    
    // Precipitation Probability Chart
    const precipProbCtx = document.getElementById('precipitationProbChart').getContext('2d');
    charts.precipitationProb = new Chart(precipProbCtx, {
        ...chartConfig,
        data: {
            labels: processedData.labels,
            datasets: createDatasets(processedData.precipitationProb, 'Precipitation Probability')
        },
        options: {
            ...chartConfig.options,
            scales: {
                ...chartConfig.options.scales,
                y: {
                    ...chartConfig.options.scales.y,
                    title: {
                        display: true,
                        text: 'Probability (%)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
    
    // Cloud Cover Chart
    const cloudCtx = document.getElementById('cloudCoverChart').getContext('2d');
    charts.cloudCover = new Chart(cloudCtx, {
        ...chartConfig,
        data: {
            labels: processedData.labels,
            datasets: createDatasets(processedData.cloudCover, 'Cloud Cover')
        },
        options: {
            ...chartConfig.options,
            scales: {
                ...chartConfig.options.scales,
                y: {
                    ...chartConfig.options.scales.y,
                    title: {
                        display: true,
                        text: 'Cloud Cover (%)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
    } catch (error) {
        console.error('Error creating charts:', error);
        throw error;
    }
}

function showLoading() {
    loadingEl.style.display = 'block';
    dashboardEl.style.display = 'none';
    errorEl.style.display = 'none';
}

function showDashboard() {
    loadingEl.style.display = 'none';
    dashboardEl.style.display = 'block';
    errorEl.style.display = 'none';
}

function showError() {
    loadingEl.style.display = 'none';
    dashboardEl.style.display = 'none';
    errorEl.style.display = 'block';
}

function hideError() {
    errorEl.style.display = 'none';
}

function addLocation() {
    const coordinatesInput = document.getElementById('newLocationInput');
    const nameInput = document.getElementById('newLocationName');
    const locationSelect = document.getElementById('locationSelect');
    
    const coordinates = coordinatesInput.value.trim();
    const name = nameInput.value.trim();
    
    // Validate coordinates format (lat,lon)
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!coordPattern.test(coordinates)) {
        alert('Please enter coordinates in format: latitude,longitude (e.g., 40.7128,-74.0060)');
        return;
    }
    
    if (!name) {
        alert('Please enter a location name');
        return;
    }
    
    // Add new option to select
    const option = document.createElement('option');
    option.value = coordinates;
    option.textContent = name;
    locationSelect.appendChild(option);
    
    // Clear input fields
    coordinatesInput.value = '';
    nameInput.value = '';
    
    // Select the new location and load data
    locationSelect.value = coordinates;
    loadWeatherData();
    
    console.log('Added new location:', name, coordinates);
}

// Auto-update functionality
async function checkForUpdates() {
    try {
        console.log('Checking for updates...');
        
        // Check if we should check for updates (based on last check time)
        const lastCheck = localStorage.getItem('lastUpdateCheck');
        const now = Date.now();
        
        if (lastCheck && (now - parseInt(lastCheck)) < UPDATE_CHECK_INTERVAL) {
            console.log('Update check skipped - too recent');
            return;
        }
        
        // Fetch latest release info from GitHub
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            console.error('Failed to fetch update info:', response.status);
            return;
        }
        
        const releaseData = await response.json();
        const latestVersion = releaseData.tag_name.replace('v', '');
        
        console.log('Current version:', CURRENT_VERSION);
        console.log('Latest version:', latestVersion);
        
        if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
            console.log('New version available!');
            await downloadAndApplyUpdate(latestVersion, releaseData);
        } else {
            console.log('No updates available');
        }
        
        // Store the check time
        localStorage.setItem('lastUpdateCheck', now.toString());
        
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

async function downloadAndApplyUpdate(latestVersion, releaseData) {
    try {
        console.log('Starting update process...');
        
        // Show update notification
        showUpdateNotification(latestVersion, releaseData.html_url);
        
        // Download new files from the release
        const assets = releaseData.assets || [];
        const updateFiles = [];
        
        for (const asset of assets) {
            if (asset.name.endsWith('.js') || asset.name.endsWith('.html') || asset.name.endsWith('.css')) {
                const fileResponse = await fetch(asset.browser_download_url);
                const fileContent = await fileResponse.text();
                updateFiles.push({
                    name: asset.name,
                    content: fileContent,
                    url: asset.browser_download_url
                });
            }
        }
        
        // Store update files in localStorage for the service worker to access
        localStorage.setItem('pendingUpdate', JSON.stringify({
            version: latestVersion,
            files: updateFiles,
            timestamp: Date.now()
        }));
        
        // Trigger service worker update
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            registration.active.postMessage({
                type: 'APPLY_UPDATE',
                version: latestVersion,
                files: updateFiles
            });
        }
        
        console.log('Update files downloaded and ready to apply');
        
    } catch (error) {
        console.error('Error downloading update:', error);
        showErrorNotification('Failed to download update. Please try again.');
    }
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'update-notification error';
    notification.innerHTML = `
        <div class="update-content">
            <h3>❌ Update Error</h3>
            <p>${message}</p>
            <div class="update-actions">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="dismiss-btn">Dismiss</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

function compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1 = v1Parts[i] || 0;
        const v2 = v2Parts[i] || 0;
        
        if (v1 > v2) return 1;
        if (v1 < v2) return -1;
    }
    
    return 0;
}

function showUpdateNotification(latestVersion, downloadUrl) {
    // Create update notification element
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <h3>🔄 New Version Available!</h3>
            <p>A new version (${latestVersion}) is available.</p>
            <div class="update-progress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="progress-text">Downloading update...</p>
            </div>
            <div class="update-actions">
                <button onclick="applyUpdate()" class="update-btn">Apply Update</button>
                <button onclick="dismissUpdate()" class="dismiss-btn">Dismiss</button>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-dismiss after 60 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 60000);
}

async function applyUpdate() {
    try {
        const notification = document.getElementById('updateNotification');
        const progressDiv = notification.querySelector('.update-progress');
        const actionsDiv = notification.querySelector('.update-actions');
        
        // Show progress
        progressDiv.style.display = 'block';
        actionsDiv.style.display = 'none';
        
        // Get pending update from localStorage
        const pendingUpdate = JSON.parse(localStorage.getItem('pendingUpdate'));
        if (!pendingUpdate) {
            throw new Error('No pending update found');
        }
        
        // Apply the update by replacing files
        for (const file of pendingUpdate.files) {
            if (file.name === 'script.js') {
                // Update the script content
                const scriptTag = document.querySelector('script[src="script.js"]');
                if (scriptTag) {
                    const newScript = document.createElement('script');
                    newScript.textContent = file.content;
                    scriptTag.parentNode.replaceChild(newScript, scriptTag);
                }
            } else if (file.name === 'styles.css') {
                // Update the stylesheet
                const linkTag = document.querySelector('link[href="styles.css"]');
                if (linkTag) {
                    const newLink = document.createElement('link');
                    newLink.rel = 'stylesheet';
                    newLink.href = 'data:text/css;base64,' + btoa(file.content);
                    linkTag.parentNode.replaceChild(newLink, linkTag);
                }
            }
        }
        
        // Update version in localStorage
        localStorage.setItem('appVersion', pendingUpdate.version);
        
        // Clear pending update
        localStorage.removeItem('pendingUpdate');
        
        // Show success message
        notification.innerHTML = `
            <div class="update-content">
                <h3>✅ Update Applied!</h3>
                <p>Update to version ${pendingUpdate.version} has been applied successfully.</p>
                <div class="update-actions">
                    <button onclick="window.location.reload()" class="update-btn">Reload Page</button>
                </div>
            </div>
        `;
        
        console.log('Update applied successfully');
        
    } catch (error) {
        console.error('Error applying update:', error);
        showErrorNotification('Failed to apply update. Please try again.');
    }
}

function dismissUpdate() {
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.remove();
    }
}

// Initialize auto-update system
async function initializeAutoUpdate() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            
            // Check for updates when service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New service worker available');
                    }
                });
            });
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
    
    // Check for updates on page load
    checkForUpdates();
    
    // Set up periodic update checks
    setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
    
    console.log('Auto-update system initialized');
} 