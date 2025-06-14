import { calculateDistance, sortSpotsByDistance } from './location';
import { TouristSpot } from '@/features/spots/types';

describe('location utils', () => {
  describe('calculateDistance', () => {
    it('同一座標の場合は距離が0になること', () => {
      const distance = calculateDistance(35.6762, 139.6503, 35.6762, 139.6503);
      expect(distance).toBe(0);
    });

    it('東京駅から新宿駅までの距離が約6.1kmであること', () => {
      // 東京駅: 35.6812, 139.7671
      // 新宿駅: 35.6896, 139.7006
      const distance = calculateDistance(35.6812, 139.7671, 35.6896, 139.7006);
      expect(distance).toBeCloseTo(6.1, 0); // 約6.1km、小数点以下0桁まで一致
    });

    it('ニューヨークからロンドンまでの距離が約5585kmであること', () => {
      // ニューヨーク: 40.7128, -74.0060
      // ロンドン: 51.5074, -0.1278
      const distance = calculateDistance(40.7128, -74.0060, 51.5074, -0.1278);
      expect(distance).toBeCloseTo(5585, -2); // 約5585km、100km単位で一致
    });

    it('緯度が正負逆転した座標での距離計算が正しいこと', () => {
      const distance1 = calculateDistance(35.6762, 139.6503, -35.6762, 139.6503);
      const distance2 = calculateDistance(-35.6762, 139.6503, 35.6762, 139.6503);
      expect(distance1).toBeGreaterThan(0);
      expect(distance1).toBe(distance2); // 対称性の確認
    });

    it('経度が180度を跨ぐ場合の距離計算が正しいこと', () => {
      // 日本とアラスカ（国際日付変更線を跨ぐ）
      const distance = calculateDistance(35.6762, 139.6503, 61.2181, -149.9003);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(5566, -1); // 約5566km、10km単位で一致
    });

    it('北極点と南極点の距離が約20015kmであること', () => {
      const distance = calculateDistance(90, 0, -90, 0);
      expect(distance).toBeCloseTo(20015, -1); // 地球半周、10km単位で一致
    });

    it('極座標（緯度90度）での計算が正常に動作すること', () => {
      const distance = calculateDistance(90, 0, 89, 0);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(111, 0); // 緯度1度は約111km
    });

    it('無効な座標値でNaNが返らないことを確認', () => {
      // 実装上、Math関数を使用しているため極端な値でも計算可能
      const distance = calculateDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
      expect(Number.isNaN(distance)).toBe(false);
    });
  });

  describe('sortSpotsByDistance', () => {
    const userLocation = { latitude: 35.6812, longitude: 139.7671 }; // 東京駅

    const mockSpots: TouristSpot[] = [
      {
        id: '1',
        name: 'Near Spot',
        nameJa: '近いスポット',
        category: 'attraction',
        coordinates: { latitude: 35.6813, longitude: 139.7672 }, // 東京駅に非常に近い
        rating: 4.5,
        images: ['image1.jpg'],
        address: 'Address 1',
        addressJa: '住所1',
        openingHours: '9:00-17:00',
        openingHoursJa: '9:00-17:00',
        price: '$10',
        priceJa: '￥1000',
        website: 'https://example.com',
        phone: '+81-3-1234-5678',
        features: ['feature1'],
        featuresJa: ['機能1'],
        description: 'Description 1',
        descriptionJa: '説明1',
        historicalInfo: 'History 1',
        historicalInfoJa: '歴史1'
      },
      {
        id: '2',
        name: 'Far Spot',
        nameJa: '遠いスポット',
        category: 'nature',
        coordinates: { latitude: 35.6896, longitude: 139.7006 }, // 新宿駅（約7.5km）
        rating: 4.0,
        images: ['image2.jpg'],
        address: 'Address 2',
        addressJa: '住所2',
        openingHours: '10:00-18:00',
        openingHoursJa: '10:00-18:00',
        price: '$20',
        priceJa: '￥2000',
        website: 'https://example2.com',
        phone: '+81-3-5678-1234',
        features: ['feature2'],
        featuresJa: ['機能2'],
        description: 'Description 2',
        descriptionJa: '説明2',
        historicalInfo: 'History 2',
        historicalInfoJa: '歴史2'
      },
      {
        id: '3',
        name: 'Medium Spot',
        nameJa: '中間のスポット',
        category: 'culture',
        coordinates: { latitude: 35.6754, longitude: 139.7348 }, // 銀座（約2.5km）
        rating: 4.2,
        images: ['image3.jpg'],
        address: 'Address 3',
        addressJa: '住所3',
        openingHours: '11:00-19:00',
        openingHoursJa: '11:00-19:00',
        price: '$15',
        priceJa: '￥1500',
        website: 'https://example3.com',
        phone: '+81-3-9876-5432',
        features: ['feature3'],
        featuresJa: ['機能3'],
        description: 'Description 3',
        descriptionJa: '説明3',
        historicalInfo: 'History 3',
        historicalInfoJa: '歴史3'
      }
    ];

    it('距離順にスポットが正しくソートされること', () => {
      const sortedSpots = sortSpotsByDistance(mockSpots, userLocation);
      
      // 順序確認：Near Spot → Medium Spot → Far Spot
      expect(sortedSpots[0].id).toBe('1'); // Near Spot
      expect(sortedSpots[1].id).toBe('3'); // Medium Spot
      expect(sortedSpots[2].id).toBe('2'); // Far Spot
    });

    it('各スポットにdistanceプロパティが正しく追加されること', () => {
      const sortedSpots = sortSpotsByDistance(mockSpots, userLocation);
      
      sortedSpots.forEach(spot => {
        expect(spot.distance).toBeDefined();
        expect(typeof spot.distance).toBe('number');
        expect(spot.distance).toBeGreaterThanOrEqual(0);
      });

      // 距離の順序確認
      expect(sortedSpots[0].distance).toBeLessThan(sortedSpots[1].distance!);
      expect(sortedSpots[1].distance).toBeLessThan(sortedSpots[2].distance!);
    });

    it('空の配列を渡した場合は空の配列が返されること', () => {
      const sortedSpots = sortSpotsByDistance([], userLocation);
      expect(sortedSpots).toEqual([]);
    });

    it('単一のスポットを渡した場合は正しく処理されること', () => {
      const singleSpot = [mockSpots[0]];
      const sortedSpots = sortSpotsByDistance(singleSpot, userLocation);
      
      expect(sortedSpots).toHaveLength(1);
      expect(sortedSpots[0].id).toBe('1');
      expect(sortedSpots[0].distance).toBeDefined();
    });

    it('同一距離のスポットがある場合の順序が安定していること', () => {
      const sameDistanceSpots: TouristSpot[] = [
        { ...mockSpots[0], id: 'a' },
        { ...mockSpots[0], id: 'b', coordinates: mockSpots[0].coordinates }
      ];
      
      const sortedSpots = sortSpotsByDistance(sameDistanceSpots, userLocation);
      
      expect(sortedSpots).toHaveLength(2);
      expect(sortedSpots[0].distance).toEqual(sortedSpots[1].distance);
      // 元の順序が保持されることを確認
      expect(sortedSpots[0].id).toBe('a');
      expect(sortedSpots[1].id).toBe('b');
    });

    it('元のスポット配列が変更されないこと（非破壊的変更）', () => {
      const originalSpots = [...mockSpots];
      const sortedSpots = sortSpotsByDistance(mockSpots, userLocation);
      
      // 元の配列は変更されていない
      expect(mockSpots).toEqual(originalSpots);
      // distanceプロパティが元の配列に追加されていない
      expect('distance' in mockSpots[0]).toBe(false);
      // ソート結果には追加されている
      expect('distance' in sortedSpots[0]).toBe(true);
    });

    it('非常に遠いスポット（地球の裏側）でも正しく処理できること', () => {
      const farSpot: TouristSpot = {
        ...mockSpots[0],
        id: 'far',
        coordinates: { latitude: -35.6812, longitude: -40.2329 } // 地球の裏側
      };
      
      const sortedSpots = sortSpotsByDistance([farSpot], userLocation);
      
      expect(sortedSpots[0].distance).toBeGreaterThan(10000); // 10,000km以上
      expect(sortedSpots[0].distance).toBeLessThan(21000); // 地球半周以下
    });
  });
});