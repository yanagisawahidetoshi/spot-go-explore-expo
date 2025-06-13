import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onToggleView}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isMapView ? 'list' : 'map'}
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onShowLanguageSelector}
          activeOpacity={0.7}
        >
          <Ionicons
            name="language"
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
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
});

export default MainHeader;