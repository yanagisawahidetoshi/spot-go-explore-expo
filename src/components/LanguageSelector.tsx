import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants';

interface LanguageSelectorProps {
  onLanguageSelect: (language: 'en' | 'ja') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🗺️</Text>
          <Text style={styles.appName}>Spot Go Explore</Text>
        </View>
        
        <Text style={styles.title}>Select Your Language</Text>
        <Text style={styles.subtitle}>言語を選択してください</Text>
        
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => onLanguageSelect('en')}
            activeOpacity={0.8}
          >
            <Text style={styles.flagEmoji}>🇺🇸</Text>
            <Text style={styles.languageText}>English</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => onLanguageSelect('ja')}
            activeOpacity={0.8}
          >
            <Text style={styles.flagEmoji}>🇯🇵</Text>
            <Text style={styles.languageText}>日本語</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  languageButtons: {
    width: '100%',
    gap: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flagEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  languageText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

export default LanguageSelector;