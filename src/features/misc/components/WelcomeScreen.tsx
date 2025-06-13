import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Colors } from '@/constants';
import { t, Language } from '@/features/language/utils/translations';

interface WelcomeScreenProps {
  language: Language;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ language }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.title}>{t('welcome', language)}</Text>
        <Text style={styles.appName}>{t('appName', language)}</Text>
        <Text style={styles.description}>
          {t('locationPermissionDesc', language)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default WelcomeScreen;