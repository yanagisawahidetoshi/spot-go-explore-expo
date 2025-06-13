import { TouristSpot } from '@/features/spots/types';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const sortSpotsByDistance = (
  spots: TouristSpot[],
  userLocation: { latitude: number; longitude: number }
): TouristSpot[] => {
  return spots
    .map(spot => ({
      ...spot,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.coordinates.latitude,
        spot.coordinates.longitude
      )
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
};