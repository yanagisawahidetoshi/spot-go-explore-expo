import { calculateDistance, sortSpotsByDistance } from '../../utils/location';
import { TouristSpot } from '../../types/spot';

describe('location utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Tokyo Tower to Senso-ji Temple (approximately 7.5km)
      const distance = calculateDistance(
        35.6586, 139.7454, // Tokyo Tower
        35.7148, 139.7967  // Senso-ji Temple
      );
      
      expect(distance).toBeGreaterThan(7);
      expect(distance).toBeLessThan(8);
    });

    it('should return 0 for same location', () => {
      const distance = calculateDistance(35.6586, 139.7454, 35.6586, 139.7454);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-35.6586, -139.7454, -35.7148, -139.7967);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('sortSpotsByDistance', () => {
    const mockSpots: TouristSpot[] = [
      {
        id: '1',
        name: 'Far Spot',
        nameJa: '遠いスポット',
        coordinates: { latitude: 35.8, longitude: 139.8 },
        category: 'attraction',
        rating: 4.5,
        images: [],
        address: '',
        addressJa: '',
        description: '',
        descriptionJa: '',
        historicalInfo: '',
        historicalInfoJa: '',
        features: [],
        featuresJa: [],
      },
      {
        id: '2',
        name: 'Near Spot',
        nameJa: '近いスポット',
        coordinates: { latitude: 35.66, longitude: 139.75 },
        category: 'attraction',
        rating: 4.0,
        images: [],
        address: '',
        addressJa: '',
        description: '',
        descriptionJa: '',
        historicalInfo: '',
        historicalInfoJa: '',
        features: [],
        featuresJa: [],
      },
      {
        id: '3',
        name: 'Medium Spot',
        nameJa: '中間のスポット',
        coordinates: { latitude: 35.7, longitude: 139.77 },
        category: 'attraction',
        rating: 4.2,
        images: [],
        address: '',
        addressJa: '',
        description: '',
        descriptionJa: '',
        historicalInfo: '',
        historicalInfoJa: '',
        features: [],
        featuresJa: [],
      },
    ];

    const userLocation = { latitude: 35.6586, longitude: 139.7454 }; // Tokyo Tower

    it('should sort spots by distance from user location', () => {
      const sorted = sortSpotsByDistance(mockSpots, userLocation);
      
      expect(sorted[0].name).toBe('Near Spot');
      expect(sorted[1].name).toBe('Medium Spot');
      expect(sorted[2].name).toBe('Far Spot');
    });

    it('should add distance property to each spot', () => {
      const sorted = sortSpotsByDistance(mockSpots, userLocation);
      
      sorted.forEach(spot => {
        expect(spot.distance).toBeDefined();
        expect(typeof spot.distance).toBe('number');
        expect(spot.distance).toBeGreaterThan(0);
      });
    });

    it('should handle empty array', () => {
      const sorted = sortSpotsByDistance([], userLocation);
      expect(sorted).toEqual([]);
    });

    it('should preserve original spot properties', () => {
      const sorted = sortSpotsByDistance(mockSpots, userLocation);
      const originalSpot = mockSpots.find(s => s.id === '1');
      const sortedSpot = sorted.find(s => s.id === '1');
      
      expect(sortedSpot?.name).toBe(originalSpot?.name);
      expect(sortedSpot?.rating).toBe(originalSpot?.rating);
      expect(sortedSpot?.category).toBe(originalSpot?.category);
    });
  });
});
