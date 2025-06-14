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

## Development

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint:fix

# Run TypeScript type checking
npm run typecheck

# Format code with Prettier
npm run prettier:fix
```

### CI/CD

This project includes GitHub Actions workflows that automatically:

- Run tests and linting on every pull request
- Check TypeScript types
- Test build process
- Prevent merging if any checks fail

#### Setting up Branch Protection

To enable quality gates on the main branch:

1. Go to your GitHub repository → Settings → Branches
2. Add a branch protection rule for `main`
3. Enable the following options:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select required status checks:
     - `🧪 Tests & Linting`
     - `🏗️ Build Check`
     - `🚦 Quality Gate`
   - ✅ Restrict pushes that create files larger than 100MB

This ensures that all code changes go through proper testing and review before being merged.

## License

MIT