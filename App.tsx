import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import Index from '@/screens/Index';
import SpotDetails from '@/screens/SpotDetails'; // 名前付きインポートからデフォルトインポートに変更
import { Colors } from '@/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

// APIキーの確認（開発時のデバッグ用）
if (__DEV__) {
  const placesApiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  const mapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!placesApiKey || placesApiKey === 'your_api_key_here' || placesApiKey.includes('ここにあなたのAPIキー')) {
    console.warn('⚠️ Google Places API key is not set in .env file');
    console.warn('The app will use mock data instead of real API data');
  }
  if (!mapsApiKey || mapsApiKey === 'your_api_key_here' || mapsApiKey.includes('ここにあなたのAPIキー')) {
    console.warn('⚠️ Google Maps API key is not set in .env file');
  }
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Index"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen 
            name="SpotDetails" 
            component={SpotDetails}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});