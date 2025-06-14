import { useRef, useEffect } from 'react';
import MapView from 'react-native-maps';
import { TouristSpot } from '@/features/spots/types';

interface UseMapAnimationProps {
  spots: TouristSpot[];
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export const useMapAnimation = ({ spots, userLocation }: UseMapAnimationProps) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (spots.length > 0 && mapRef.current) {
      const coordinates = [
        userLocation,
        ...spots.map(spot => spot.coordinates),
      ];
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [spots, userLocation]);

  const centerOnUser = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  return {
    mapRef,
    centerOnUser,
  };
};