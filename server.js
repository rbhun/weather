const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'locations.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from public directory

// Initialize locations data file if it doesn't exist
function initializeDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const defaultLocations = [
            {
                id: 1,
                name: "Origo Studios, Hungary",
                coordinates: "47.4979,19.0402",
                addedBy: "system",
                addedAt: new Date().toISOString()
            }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultLocations, null, 2));
    }
}

// Read locations from file
function readLocations() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading locations:', error);
        return [];
    }
}

// Write locations to file
function writeLocations(locations) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(locations, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing locations:', error);
        return false;
    }
}

// Generate unique ID
function generateId(locations) {
    const maxId = locations.reduce((max, location) => Math.max(max, location.id || 0), 0);
    return maxId + 1;
}

// API Routes

// Get all locations
app.get('/api/locations', (req, res) => {
    try {
        const locations = readLocations();
        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch locations'
        });
    }
});

// Add new location
app.post('/api/locations', (req, res) => {
    try {
        const { name, coordinates } = req.body;
        
        // Validate input
        if (!name || !coordinates) {
            return res.status(400).json({
                success: false,
                error: 'Name and coordinates are required'
            });
        }
        
        // Validate coordinates format
        const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
        if (!coordPattern.test(coordinates)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates format. Use: latitude,longitude'
            });
        }
        
        const locations = readLocations();
        
        // Check if location already exists
        const existingLocation = locations.find(loc => 
            loc.coordinates === coordinates || loc.name === name
        );
        
        if (existingLocation) {
            return res.status(409).json({
                success: false,
                error: 'Location already exists'
            });
        }
        
        // Add new location
        const newLocation = {
            id: generateId(locations),
            name: name.trim(),
            coordinates: coordinates.trim(),
            addedBy: req.ip || 'unknown',
            addedAt: new Date().toISOString()
        };
        
        locations.push(newLocation);
        
        if (writeLocations(locations)) {
            res.status(201).json({
                success: true,
                data: newLocation,
                message: 'Location added successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save location'
            });
        }
        
    } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add location'
        });
    }
});

// Update location
app.put('/api/locations/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, coordinates } = req.body;
        
        const locations = readLocations();
        const locationIndex = locations.findIndex(loc => loc.id === parseInt(id));
        
        if (locationIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }
        
        // Validate coordinates if provided
        if (coordinates) {
            const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
            if (!coordPattern.test(coordinates)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid coordinates format. Use: latitude,longitude'
                });
            }
        }
        
        // Update location
        if (name) locations[locationIndex].name = name.trim();
        if (coordinates) locations[locationIndex].coordinates = coordinates.trim();
        locations[locationIndex].updatedAt = new Date().toISOString();
        
        if (writeLocations(locations)) {
            res.json({
                success: true,
                data: locations[locationIndex],
                message: 'Location updated successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to update location'
            });
        }
        
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update location'
        });
    }
});

// Delete location
app.delete('/api/locations/:id', (req, res) => {
    try {
        const { id } = req.params;
        const locations = readLocations();
        const locationIndex = locations.findIndex(loc => loc.id === parseInt(id));
        
        if (locationIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }
        
        // Don't allow deleting the default location
        if (locations[locationIndex].addedBy === 'system') {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete default location'
            });
        }
        
        const deletedLocation = locations.splice(locationIndex, 1)[0];
        
        if (writeLocations(locations)) {
            res.json({
                success: true,
                data: deletedLocation,
                message: 'Location deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete location'
            });
        }
        
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete location'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Weather Dashboard API is running',
        timestamp: new Date().toISOString()
    });
});

// Initialize data file on startup
initializeDataFile();

// Start server
app.listen(PORT, () => {
    console.log(`Weather Dashboard API server running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET    /api/locations     - Get all locations`);
    console.log(`  POST   /api/locations     - Add new location`);
    console.log(`  PUT    /api/locations/:id - Update location`);
    console.log(`  DELETE /api/locations/:id - Delete location`);
    console.log(`  GET    /api/health        - Health check`);
});

