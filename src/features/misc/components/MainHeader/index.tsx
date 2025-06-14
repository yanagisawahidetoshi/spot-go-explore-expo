import React from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { t, Language } from '@/features/language/utils/translations';
import { styles } from './styles';

interface Props {
  isMapView: boolean;
  onToggleView: () => void;
  onShowLanguageSelector: () => void;
  language: Language;
}

const MainHeader: React.FC<Props> = ({
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

export default MainHeader;