import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants';
import { t, Language } from '@/utils/translations';

interface MainHeaderProps {
  isMapView: boolean;
  onToggleView: () => void;
  onShowLanguageSelector: () => void;
  language: Language;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  isMapView,
  onToggleView,
  onShowLanguageSelector,
  language,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('nearbySpots', language)}</Text>
      
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          onPress={onToggleView}
        >
          <Text style={styles.buttonText}>
            {isMapView ? '📋' : '🗺️'}
          </Text>
        </Pressable>
        
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          onPress={onShowLanguageSelector}
        >
          <Text style={styles.buttonText}>🌐</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
  },
  iconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});

export default MainHeader;