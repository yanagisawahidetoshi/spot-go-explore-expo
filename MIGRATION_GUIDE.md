# Migration Guide: Vite to Expo

This guide explains the key changes made when converting the original Vite + React web app to React Native with Expo.

## Key Changes

### 1. Project Structure
- Replaced Vite config with Expo configuration (`app.json`, `babel.config.js`)
- Changed from `src/pages` to `src/screens` for better React Native convention
- Removed web-specific files (index.html, vite.config.ts)

### 2. Routing
- **Before**: React Router DOM
- **After**: React Navigation (Native Stack Navigator)
- Navigation is now handled through navigation props instead of URL routing

### 3. Styling
- **Before**: Tailwind CSS + shadcn/ui
- **After**: React Native StyleSheet API
- Created a centralized color system in `src/constants/colors.ts`
- All styles are now React Native compatible

### 4. Components

#### Replaced Web Components:
- `<div>` → `<View>`
- `<span>`, `<p>`, `<h1>` → `<Text>`
- `<img>` → `<Image>`
- `<button>` → `<TouchableOpacity>` or `<TouchableHighlight>`

#### UI Library Changes:
- Removed shadcn/ui components
- Created custom React Native components with similar functionality
- Used Expo vector icons instead of Lucide React

### 5. Location Services
- **Before**: Browser Geolocation API
- **After**: Expo Location API
- Added proper permission handling for iOS and Android

### 6. Storage
- **Before**: localStorage
- **After**: AsyncStorage
- All persistent data now uses AsyncStorage

### 7. Maps
- **Before**: Web-based map library
- **After**: react-native-maps
- Configured for both iOS (Apple Maps) and Android (Google Maps)

### 8. API Integration
- HTTP requests remain largely the same
- Added proper error handling for mobile network conditions

## Platform-Specific Code

When needed, use platform-specific extensions:
- `Component.ios.tsx` for iOS-specific code
- `Component.android.tsx` for Android-specific code

## Testing

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (Expo Web)
```bash
npm run web
```

## Performance Optimizations

1. **Image Optimization**: Use appropriate image sizes and formats
2. **List Performance**: Implemented FlatList for better performance with large lists
3. **Lazy Loading**: Components are loaded on-demand with React Navigation

## Known Limitations

1. Some CSS animations are not directly translatable to React Native
2. Web-specific features (hover effects) need alternative implementations
3. File system access is different in React Native

## Next Steps

1. Add real API endpoints to replace mock data
2. Implement push notifications
3. Add offline support with data caching
4. Enhance animations with React Native Reanimated
5. Add app icons and splash screens in the assets folder

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)