import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { t, Language } from '@/features/language/utils/translations';
import { styles } from './styles';

interface Props {
  language: Language;
}

const WelcomeScreen: React.FC<Props> = ({ language }) => {
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

export default WelcomeScreen;