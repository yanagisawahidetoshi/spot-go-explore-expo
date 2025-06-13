import { t, translations } from '../../utils/translations';

describe('translations utility', () => {
  describe('t function', () => {
    it('should return English translation for valid key', () => {
      expect(t('welcome', 'en')).toBe('Welcome to');
      expect(t('appName', 'en')).toBe('GO! SPOT');
      expect(t('loading', 'en')).toBe('Loading...');
    });

    it('should return Japanese translation for valid key', () => {
      expect(t('welcome', 'ja')).toBe('ようこそ');
      expect(t('appName', 'ja')).toBe('GO! SPOT');
      expect(t('loading', 'ja')).toBe('読み込み中...');
    });

    it('should handle nested keys', () => {
      expect(t('categories.attraction', 'en')).toBe('Attractions');
      expect(t('categories.attraction', 'ja')).toBe('観光名所');
      expect(t('categories.food', 'en')).toBe('Food');
      expect(t('categories.food', 'ja')).toBe('グルメ');
    });

    it('should return key if translation not found', () => {
      expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
      expect(t('nonexistent.key', 'ja')).toBe('nonexistent.key');
    });

    it('should default to English if language not specified', () => {
      expect(t('welcome')).toBe('Welcome to');
    });
  });

  describe('translations object', () => {
    it('should have same keys for both languages', () => {
      const enKeys = Object.keys(translations.en);
      const jaKeys = Object.keys(translations.ja);
      
      expect(enKeys).toEqual(jaKeys);
    });

    it('should have categories object with same structure', () => {
      const enCategoryKeys = Object.keys(translations.en.categories);
      const jaCategoryKeys = Object.keys(translations.ja.categories);
      
      expect(enCategoryKeys).toEqual(jaCategoryKeys);
    });
  });
});
