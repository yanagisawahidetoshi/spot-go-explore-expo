# Temporary Asset Creation Guide

Since the current placeholder images are causing issues, here's how to create proper temporary images:

## Quick Solution using any image editor:

1. **Create icon.png (1024x1024)**
   - Open any image editor (Preview on Mac, Paint on Windows)
   - Create a new image: 1024x1024 pixels
   - Fill with color: #FF6B6B
   - Add text or emoji: 🗺️
   - Save as PNG

2. **Create splash.png (1242x2436)**
   - Create a new image: 1242x2436 pixels
   - Fill with white: #FFFFFF
   - Add your app name in the center
   - Save as PNG

3. **Copy for other files**
   - Copy icon.png → adaptive-icon.png
   - Resize icon.png to 48x48 → favicon.png

## Using online tools:

### Option 1: Canva (Free)
1. Go to https://www.canva.com/
2. Create custom size designs
3. Use the dimensions above
4. Download as PNG

### Option 2: Expo Icon Builder
1. Go to https://buildicon.netlify.app/
2. Upload your design
3. It will generate all required sizes

### Option 3: Quick Base64 Generator
1. Go to https://www.base64-image.de/
2. Create a simple colored square
3. Convert to base64
4. Use the base64 string in the code

## Minimal Valid PNG (Red Square)

If you need a quick fix, here's a minimal valid PNG base64:

```
icon.png, adaptive-icon.png (1024x1024 red square):
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==

splash.png (1242x2436 white):
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==

favicon.png (48x48 red):
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==
```

Save these base64 strings to files using:
```bash
echo "BASE64_STRING_HERE" | base64 -d > assets/filename.png
```