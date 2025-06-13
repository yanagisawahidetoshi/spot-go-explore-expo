export * from './colors';

export const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';

export const DEFAULT_LOCATION = {
  latitude: 35.6762,
  longitude: 139.6503,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const CATEGORIES = {
  attraction: { icon: 'camera', color: '#FF6B6B' },
  food: { icon: 'restaurant', color: '#FFA502' },
  shopping: { icon: 'shopping-bag', color: '#4ECDC4' },
  nature: { icon: 'tree', color: '#27AE60' },
  culture: { icon: 'bank', color: '#9B59B6' },
} as const;