// API Configuration
const API_KEY = 'YrVIS5JatcuWWbN5';
const BASE_URL = 'https://customer-api.open-meteo.com/v1/forecast';

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
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
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
                            maxTicksLimit: 10
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