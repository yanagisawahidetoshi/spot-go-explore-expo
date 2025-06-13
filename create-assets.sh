#!/bin/bash

# Create proper placeholder images for Expo
echo "Creating placeholder images..."

# Create assets directory if it doesn't exist
mkdir -p assets

# Create a simple 1024x1024 PNG for icon
convert -size 1024x1024 xc:"#FF6B6B" -gravity center -pointsize 500 -fill white -annotate +0+0 "🗺️" assets/icon.png 2>/dev/null || \
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 -d > assets/icon.png

# Create a simple 1242x2436 PNG for splash
convert -size 1242x2436 xc:white -gravity center -pointsize 200 -fill "#FF6B6B" -annotate +0+0 "Spot Go\nExplore" assets/splash.png 2>/dev/null || \
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > assets/splash.png

# Create adaptive icon
cp assets/icon.png assets/adaptive-icon.png

# Create favicon
convert -size 48x48 xc:"#FF6B6B" assets/favicon.png 2>/dev/null || \
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 -d > assets/favicon.png

echo "Placeholder images created!"