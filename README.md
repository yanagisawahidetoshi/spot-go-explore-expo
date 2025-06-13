# Spot Go Explore - Expo Version

A React Native (Expo) version of the tourist spot exploration app. This app helps users discover nearby tourist attractions using their current location.

## Features

- 📍 Location-based tourist spot discovery
- 🗺️ Interactive map view
- 📋 List view of attractions
- 🌐 Multi-language support (English & Japanese)
- 📱 Native mobile experience

## Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/yanagisawahidetoshi/spot-go-explore-expo.git

# Navigate to project directory
cd spot-go-explore-expo

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the app

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
spot-go-explore-expo/
├── src/
│   ├── components/     # Reusable components
│   ├── screens/        # Screen components
│   ├── hooks/          # Custom hooks
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── constants/      # App constants
├── assets/            # Images and fonts
├── App.tsx            # Root component
├── app.json           # Expo configuration
└── package.json       # Dependencies
```

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- React Query (TanStack Query)
- Expo Location
- React Native Maps
- AsyncStorage

## License

MIT