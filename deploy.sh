#!/bin/bash

# Weather Dashboard Deployment Script

echo "🚀 Deploying Weather Dashboard with Server-Side Location Storage..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create locations.json if it doesn't exist
if [ ! -f "locations.json" ]; then
    echo "📝 Creating initial locations database..."
    echo '[
  {
    "id": 1,
    "name": "Origo Studios, Hungary",
    "coordinates": "47.4979,19.0402",
    "addedBy": "system",
    "addedAt": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
  }
]' > locations.json
fi

# Start the server
echo "🌐 Starting Weather Dashboard server..."
echo "📍 Server will be available at: http://localhost:3000"
echo "🔧 API endpoints:"
echo "   GET    /api/locations     - Get all locations"
echo "   POST   /api/locations     - Add new location"
echo "   PUT    /api/locations/:id - Update location"
echo "   DELETE /api/locations/:id - Delete location"
echo "   GET    /api/health        - Health check"
echo ""
echo "✨ Server-side location storage is now active!"
echo "   - Locations are saved to locations.json"
echo "   - All users share the same location list"
echo "   - Locations persist across browser sessions"
echo ""
echo "Press Ctrl+C to stop the server"

# Start the server
node server.js

