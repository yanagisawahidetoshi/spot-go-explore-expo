import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { TouristSpot } from '@/features/spots/types';
import { CATEGORIES } from '@/constants';
import { t, Language } from '@/features/language/utils/translations';
import { useMapAnimation } from './hooks/useMapAnimation';
import { styles } from './styles';

interface Props {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  spots: TouristSpot[];
  loading: boolean;
  onSpotSelect: (spot: TouristSpot) => void;
  language: Language;
}

const SpotMapView: React.FC<Props> = ({
  userLocation,
  spots,
  loading,
  onSpotSelect,
  language,
}) => {
  const { mapRef, centerOnUser } = useMapAnimation({ spots, userLocation });

  const initialRegion: Region = {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CATEGORIES.attraction.color} />
        <Text style={styles.loadingText}>{t('loading', language)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
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
                 spot.category === 'nature' ? '🌳' :
                 spot.category === 'culture' ? '🏛️' : '📍'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <Pressable
        style={({ pressed }) => [
          styles.centerButton,
          pressed && styles.centerButtonPressed,
        ]}
        onPress={centerOnUser}
      >
        <Text style={styles.centerIcon}>📍</Text>
      </Pressable>
    </View>
  );
};

export default SpotMapView;