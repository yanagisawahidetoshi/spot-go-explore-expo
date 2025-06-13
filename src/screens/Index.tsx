import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import MapView from '@/components/MapView';
import MainHeader from '@/components/MainHeaderSimple'; // 一時的にシンプル版を使用
import PermissionModal from '@/components/PermissionModalSimple'; // 一時的にシンプル版を使用
import SpotsList from '@/components/SpotsListSimple'; // 一時的にシンプル版を使用
import WelcomeScreen from '@/components/WelcomeScreen';
import LanguageSelector from '@/components/LanguageSelector';

import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useTouristSpots } from '@/hooks/useTouristSpots';
import { useLanguage } from '@/hooks/useLanguage';
import { TouristSpot } from '@/types/spot';
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
  }, [isLanguageLoading, language]);

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
            <MapView 
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