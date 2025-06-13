import React from 'react';
import { View, Text } from 'react-native';

// Temporary icon component
export default function Icon() {
  return (
    <View style={{
      width: 1024,
      height: 1024,
      backgroundColor: '#FF6B6B',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 500 }}>🗺️</Text>
    </View>
  );
}