// App configuration
export const config = {
  api: {
    googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  app: {
    name: 'GO! SPOT',
    defaultLanguage: 'en' as const,
    searchRadius: 50000, // 50km
    maxSpots: 20,
  },
  storage: {
    keys: {
      language: '@spot-go-explore:language',
      visitedSpots: '@spot-go-explore:visited',
      favorites: '@spot-go-explore:favorites',
    },
  },
  speech: {
    defaultRate: 1.0,
    rates: [0.75, 1.0, 1.25],
  },
} as const;

export type Config = typeof config;
