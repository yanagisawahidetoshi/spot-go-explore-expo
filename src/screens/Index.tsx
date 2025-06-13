import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import MapViewSimple from '@/features/map/components/MapView';
import MainHeader from '@/features/misc/components/MainHeader';
import PermissionModal from '@/features/location/components/PermissionModal';
import SpotsList from '@/features/spots/components/SpotsList';
import WelcomeScreen from '@/features/misc/components/WelcomeScreen';
import LanguageSelector from '@/features/language/components/LanguageSelector';

import { useLocationPermission } from '@/features/location/hooks/useLocationPermission';
import { useTouristSpots } from '@/features/spots/hooks/useTouristSpots';
import { useLanguage } from '@/features/language/hooks/useLanguage';
import { TouristSpot } from '@/features/spots/types';
import { RootStackParamList } from '@/types/navigation';
import { Colors } from '@/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Index = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isMapView, setIsMapView] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const { hasPermission, requestPermission, userLocation } = useLocationPermission();
  const { spots, loading } = useTouristSpots(userLocation);
  const { language, isLoading: isLanguageLoading, changeLanguage } = useLanguage();

  useEffect(() => {
    if (!isLanguageLoading && language === null) {
      setShowLanguageSelector(true);
    }
  }, [isLanguageLoading, language]); // 修正: 余分な ] を削除

  const handleSpotSelect = (spot: TouristSpot) => {
    navigation.navigate('SpotDetails', { spot, language });
  };

  const handleLanguageSelect = async (lang: 'en' | 'ja') => {
    await changeLanguage(lang);
    setShowLanguageSelector(false);
  };

  if (showLanguageSelector || (!language && !isLanguageLoading)) {
    return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MainHeader
        isMapView={isMapView}
        onToggleView={() => setIsMapView(!isMapView)}
        onShowLanguageSelector={() => setShowLanguageSelector(true)}
        language={language}
      />

      {!hasPermission && (
        <PermissionModal
          language={language}
          onRequestPermission={requestPermission}
        />
      )}

      <View style={styles.content}>
        {hasPermission && userLocation ? (
          isMapView ? (
            <MapViewSimple 
              userLocation={userLocation}
              spots={spots}
              loading={loading}
              onSpotSelect={handleSpotSelect}
              language={language}
            />
          ) : (
            <SpotsList
              spots={spots}
              loading={loading}
              language={language}
              onSpotSelect={handleSpotSelect}
            />
          )
        ) : (
          <WelcomeScreen language={language} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});

export default Index;