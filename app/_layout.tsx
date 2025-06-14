import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { config } from '@/config';

// APIキーの確認（開発時のデバッグ用）
if (__DEV__) {
  const { googlePlacesApiKey, googleMapsApiKey } = config.api;
  
  if (!googlePlacesApiKey || googlePlacesApiKey === 'your_api_key_here' || googlePlacesApiKey.includes('ここにあなたのAPIキー')) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Google Places API key is not set in .env file');
    // eslint-disable-next-line no-console
    console.warn('The app will use mock data instead of real API data');
  }
  if (!googleMapsApiKey || googleMapsApiKey === 'your_api_key_here' || googleMapsApiKey.includes('ここにあなたのAPIキー')) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Google Maps API key is not set in .env file');
  }
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: 'Home'
          }} 
        />
        <Stack.Screen 
          name="spot/[id]" 
          options={{ 
            headerShown: false,
            title: 'Spot Details',
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}