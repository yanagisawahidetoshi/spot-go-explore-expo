import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AppNavigator } from '@/routes';
import { Colors } from '@/constants';
import { config } from '@/config';

// APIキーの確認（開発時のデバッグ用）
if (__DEV__) {
  const { googlePlacesApiKey, googleMapsApiKey } = config.api;
  
  if (!googlePlacesApiKey || googlePlacesApiKey === 'your_api_key_here' || googlePlacesApiKey.includes('ここにあなたのAPIキー')) {
    console.warn('⚠️ Google Places API key is not set in .env file');
    console.warn('The app will use mock data instead of real API data');
  }
  if (!googleMapsApiKey || googleMapsApiKey === 'your_api_key_here' || googleMapsApiKey.includes('ここにあなたのAPIキー')) {
    console.warn('⚠️ Google Maps API key is not set in .env file');
  }
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});