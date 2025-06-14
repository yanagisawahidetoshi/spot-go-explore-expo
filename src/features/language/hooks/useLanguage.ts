import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../utils/translations';

const LANGUAGE_KEY = '@spot-go-explore:language';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage === 'ja' || savedLanguage === 'en') {
        setLanguage(savedLanguage);
      }
    } catch {
      // console.error('Error loading language');
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      setLanguage(newLanguage);
    } catch {
      // console.error('Error saving language');
    }
  };

  return {
    language,
    isLoading,
    changeLanguage,
  };
};