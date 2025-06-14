import React from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';

interface Props {
  onLanguageSelect: (language: 'en' | 'ja') => void;
}

const LanguageSelector: React.FC<Props> = ({ onLanguageSelect }) => {
  return (
    <SafeAreaView style={styles.container} testID="language-selector-container">
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🗺️</Text>
          <Text style={styles.appName}>Spot Go Explore</Text>
        </View>
        
        <Text style={styles.title}>Select Your Language</Text>
        <Text style={styles.subtitle}>言語を選択してください</Text>
        
        <View style={styles.languageButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.languageButton,
              pressed && styles.languageButtonPressed,
            ]}
            onPress={() => onLanguageSelect('en')}
            testID="language-button-en"
          >
            <Text style={styles.flagEmoji}>🇺🇸</Text>
            <Text style={styles.languageText}>English</Text>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.languageButton,
              pressed && styles.languageButtonPressed,
            ]}
            onPress={() => onLanguageSelect('ja')}
            testID="language-button-ja"
          >
            <Text style={styles.flagEmoji}>🇯🇵</Text>
            <Text style={styles.languageText}>日本語</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelector;