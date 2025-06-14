import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './app/index';
import { config } from './src/config';

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

// React Query クライアントの作成
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5分
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Index />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}