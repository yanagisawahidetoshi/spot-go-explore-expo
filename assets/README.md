# Asset Setup Guide

This directory needs proper image assets for the app to work correctly. The placeholder files are minimal 1x1 pixel images that need to be replaced.

## Required Assets

1. **icon.png** (1024x1024)
   - App icon for iOS and Android
   - Should be a square image with your app logo
   - No transparency for iOS

2. **splash.png** (1242x2436)
   - Splash screen shown while app loads
   - Should match your app's branding

3. **adaptive-icon.png** (1024x1024)
   - Android adaptive icon foreground
   - Should have transparent background
   - Will be masked by Android system

4. **favicon.png** (48x48)
   - Web favicon for Expo web

## Quick Icon Generation

You can quickly generate a basic icon using the emoji design:

1. Create a 1024x1024 image with:
   - Background: #FF6B6B (app primary color)
   - Center: 🗺️ emoji or custom logo
   
2. For splash screen:
   - Background: #FFFFFF (white)
   - Center: Your logo with app name

## Recommended Tools

- **Figma**: Free design tool for creating icons
- **Canva**: Easy templates for app icons
- **makeappicon.com**: Generate all sizes from one image
- **Expo Icon Builder**: https://buildicon.netlify.app/

## Using Expo's Asset Generation

After adding your base images, you can use Expo to generate all required sizes:

```bash
npx expo-optimize
```

This will optimize your images for production use.