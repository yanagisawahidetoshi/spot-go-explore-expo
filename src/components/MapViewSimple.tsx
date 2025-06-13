import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { TouristSpot } from '@/types/spot';
import { Colors, CATEGORIES } from '@/constants';
import { t, Language } from '@/utils/translations';

interface MapViewProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  spots: TouristSpot[];
  loading: boolean;
  onSpotSelect: (spot: TouristSpot) => void;
  language: Language;
}

const SpotMapView: React.FC<MapViewProps> = ({
  userLocation,
  spots,
  loading,
  onSpotSelect,
  language,
}) => {
  const mapRef = useRef<MapView>(null);

  const initialRegion: Region = {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('loading', language)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={spot.coordinates}
            onPress={() => onSpotSelect(spot)}
          >
            <View style={[
              styles.markerContainer,
              { backgroundColor: CATEGORIES[spot.category].color }
            ]}>
              <Text style={styles.markerIcon}>
                {spot.category === 'attraction' ? '📸' :
                 spot.category === 'food' ? '🍽️' :
                 spot.category === 'shopping' ? '🛍️' :
                 spot.category === 'nature' ? '🌳' : '🏛️'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerOnUser}
        activeOpacity={0.8}
      >
        <Text style={styles.centerIcon}>📍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  markerIcon: {
    fontSize: 20,
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  centerIcon: {
    fontSize: 24,
  },
});

export default SpotMapView;