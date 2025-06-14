import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SpotMapView from '@/features/map/components/MapView';
import MainHeader from '@/features/misc/components/MainHeader';
import PermissionModal from '@/features/location/components/PermissionModal';
import SpotsList from '@/features/spots/components/SpotsList';
import WelcomeScreen from '@/features/misc/components/WelcomeScreen';
import LanguageSelector from '@/features/language/components/LanguageSelector';
import { WikiPOCDemo } from '@/features/wiki-poc/WikiPOCDemo';

import { useLocationPermission } from '@/features/location/hooks/useLocationPermission';
import { useTouristSpots } from '@/features/spots/hooks/useTouristSpots';
import { useLanguage } from '@/features/language/hooks/useLanguage';
import { TouristSpot } from '@/features/spots/types';
import { Colors } from '@/constants';

const Index = () => {
  const [isMapView, setIsMapView] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showWikiPOC, setShowWikiPOC] = useState(false);
  
  const { hasPermission, requestPermission, userLocation } = useLocationPermission();
  const { spots, loading } = useTouristSpots(userLocation);
  const { language, isLoading: isLanguageLoading, changeLanguage } = useLanguage();

  useEffect(() => {
    if (!isLanguageLoading && language === null) {
      setShowLanguageSelector(true);
    }
  }, [isLanguageLoading, language]);

  const handleSpotSelect = (spot: TouristSpot) => {
    // スポットの詳細をアラートで表示（後で詳細画面を実装）
    Alert.alert(
      spot.name,
      `${spot.description}\n\n評価: ${spot.rating}⭐\n距離: ${Math.round(spot.distance)}m`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '経路案内', 
          onPress: () => {
            Alert.alert('経路案内', '地図アプリを開く機能は後で実装します');
          }
        },
        {
          text: 'Wiki情報を見る',
          onPress: () => {
            // Wiki POCを表示（スポット名を渡す）
            setShowWikiPOC(spot.name);
          }
        }
      ]
    );
  };

  const handleLanguageSelect = async (lang: 'en' | 'ja') => {
    await changeLanguage(lang);
    setShowLanguageSelector(false);
  };

  if (showLanguageSelector || (!language && !isLanguageLoading)) {
    return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
  }

  // Wiki POCを表示
  if (showWikiPOC) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.pocHeader}>
          <Button title="← 戻る" onPress={() => setShowWikiPOC(false)} />
        </View>
        <WikiPOCDemo initialSearchQuery={typeof showWikiPOC === 'string' ? showWikiPOC : undefined} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MainHeader
        isMapView={isMapView}
        onToggleView={() => setIsMapView(!isMapView)}
        onShowLanguageSelector={() => setShowLanguageSelector(true)}
        language={language}
      />

      {/* Wiki POCボタン */}
      <View style={styles.pocButtonContainer}>
        <Button 
          title="🔍 Wiki統合POCを試す" 
          onPress={() => setShowWikiPOC(true)} 
          color="#FF6B6B"
        />
      </View>

      {!hasPermission && (
        <PermissionModal
          language={language}
          onRequestPermission={requestPermission}
        />
      )}

      <View style={styles.content}>
        {hasPermission && userLocation ? (
          isMapView ? (
            <SpotMapView 
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
  pocButtonContainer: {
    padding: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pocHeader: {
    padding: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});

export default Index;