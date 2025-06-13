import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStoredLanguage,
  setStoredLanguage,
  getVisitedSpots,
  addVisitedSpot,
  getFavoriteSpots,
  toggleFavoriteSpot,
  clearAllData,
} from '../../utils/storage';

// AsyncStorageのモックをクリア
beforeEach(() => {
  AsyncStorage.clear();
});

describe('storage utilities', () => {
  describe('language storage', () => {
    it('should store and retrieve language preference', async () => {
      await setStoredLanguage('ja');
      const language = await getStoredLanguage();
      expect(language).toBe('ja');
    });

    it('should return null if no language stored', async () => {
      const language = await getStoredLanguage();
      expect(language).toBeNull();
    });

    it('should overwrite existing language preference', async () => {
      await setStoredLanguage('en');
      await setStoredLanguage('ja');
      const language = await getStoredLanguage();
      expect(language).toBe('ja');
    });
  });

  describe('visited spots storage', () => {
    it('should return empty array initially', async () => {
      const spots = await getVisitedSpots();
      expect(spots).toEqual([]);
    });

    it('should add visited spot', async () => {
      await addVisitedSpot('spot1');
      const spots = await getVisitedSpots();
      expect(spots).toEqual(['spot1']);
    });

    it('should not add duplicate visited spots', async () => {
      await addVisitedSpot('spot1');
      await addVisitedSpot('spot1');
      const spots = await getVisitedSpots();
      expect(spots).toEqual(['spot1']);
    });

    it('should maintain order of visited spots', async () => {
      await addVisitedSpot('spot1');
      await addVisitedSpot('spot2');
      await addVisitedSpot('spot3');
      const spots = await getVisitedSpots();
      expect(spots).toEqual(['spot3', 'spot2', 'spot1']);
    });
  });

  describe('favorite spots storage', () => {
    it('should return empty array initially', async () => {
      const favorites = await getFavoriteSpots();
      expect(favorites).toEqual([]);
    });

    it('should add spot to favorites', async () => {
      await toggleFavoriteSpot('spot1');
      const favorites = await getFavoriteSpots();
      expect(favorites).toEqual(['spot1']);
    });

    it('should remove spot from favorites when toggled again', async () => {
      await toggleFavoriteSpot('spot1');
      await toggleFavoriteSpot('spot1');
      const favorites = await getFavoriteSpots();
      expect(favorites).toEqual([]);
    });

    it('should handle multiple favorite spots', async () => {
      await toggleFavoriteSpot('spot1');
      await toggleFavoriteSpot('spot2');
      await toggleFavoriteSpot('spot3');
      const favorites = await getFavoriteSpots();
      expect(favorites).toContain('spot1');
      expect(favorites).toContain('spot2');
      expect(favorites).toContain('spot3');
      expect(favorites).toHaveLength(3);
    });
  });

  describe('clearAllData', () => {
    it('should clear all stored data', async () => {
      // Store some data
      await setStoredLanguage('ja');
      await addVisitedSpot('spot1');
      await toggleFavoriteSpot('spot2');

      // Clear all data
      await clearAllData();

      // Verify all data is cleared
      const language = await getStoredLanguage();
      const visited = await getVisitedSpots();
      const favorites = await getFavoriteSpots();

      expect(language).toBeNull();
      expect(visited).toEqual([]);
      expect(favorites).toEqual([]);
    });
  });
});
