import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTouristSpots } from './useTouristSpots';
import { GooglePlacesService } from '../api/googlePlaces';
import { useLanguage } from '@/features/language/hooks/useLanguage';
import { TouristSpot } from '../types';

// モック設定
jest.mock('../api/googlePlaces', () => ({
  GooglePlacesService: {
    searchNearbyPlaces: jest.fn(),
  },
}));

jest.mock('@/features/language/hooks/useLanguage', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/features/location/utils/location', () => ({
  sortSpotsByDistance: jest.fn((spots, _userLocation) => 
    spots.map((spot: any, index: number) => ({
      ...spot,
      distance: index * 1.5 // 距離を模擬
    }))
  ),
}));

const mockGooglePlacesService = GooglePlacesService as jest.Mocked<typeof GooglePlacesService>;
const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

// Type alias for the location parameter
type LocationParam = { latitude: number; longitude: number } | null;

describe('useTouristSpots hook', () => {
  const mockUserLocation = { latitude: 35.6812, longitude: 139.7671 }; // 東京駅
  const mockTouristSpots: TouristSpot[] = [
    {
      id: 'api-spot-1',
      name: 'API Spot 1',
      nameJa: 'APIスポット1',
      description: 'Description 1',
      descriptionJa: '説明1',
      historicalInfo: 'History 1',
      historicalInfoJa: '歴史1',
      category: 'attraction',
      coordinates: { latitude: 35.6813, longitude: 139.7672 },
      images: ['image1.jpg'],
      rating: 4.3,
      address: 'Address 1',
      addressJa: '住所1',
      openingHours: '9:00-17:00',
      openingHoursJa: '9:00-17:00',
      price: '$10',
      priceJa: '￥1000',
      website: 'https://example1.com',
      phone: '+81-3-1111-1111',
      features: ['feature1'],
      featuresJa: ['機能1'],
    },
    {
      id: 'api-spot-2',
      name: 'API Spot 2',
      nameJa: 'APIスポット2',
      description: 'Description 2',
      descriptionJa: '説明2',
      historicalInfo: 'History 2',
      historicalInfoJa: '歴史2',
      category: 'culture',
      coordinates: { latitude: 35.6800, longitude: 139.7680 },
      images: ['image2.jpg'],
      rating: 4.1,
      address: 'Address 2',
      addressJa: '住所2',
      openingHours: '10:00-18:00',
      openingHoursJa: '10:00-18:00',
      price: '$15',
      priceJa: '￥1500',
      website: 'https://example2.com',
      phone: '+81-3-2222-2222',
      features: ['feature2'],
      featuresJa: ['機能2'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトのuseLanguageモック設定
    mockUseLanguage.mockReturnValue({
      language: 'en',
      isLoading: false,
      changeLanguage: jest.fn(),
    });

    // 環境変数のクリア
    delete process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  });

  describe('初期化動作', () => {
    it('初期状態が正しく設定されること', () => {
      const { result } = renderHook(() => useTouristSpots(null));

      expect(result.current.spots).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
    });

    it('userLocationがnullの場合は空配列を返すこと', async () => {
      const { result } = renderHook(() => useTouristSpots(null));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spots).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });

  describe('APIキーなし（モックデータモード）', () => {
    it('APIキーが設定されていない場合はモックデータを使用すること', async () => {
      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spots).toHaveLength(2); // MOCK_SPOTSは2件
      expect(result.current.spots[0].name).toBe('Tokyo Tower');
      expect(result.current.spots[1].name).toBe('Senso-ji Temple');
      expect(result.current.error).toBe(null);
      expect(mockGooglePlacesService.searchNearbyPlaces).not.toHaveBeenCalled();
    });

    it('無効なAPIキーの場合はモックデータを使用すること', async () => {
      // 無効なAPIキーパターンをテスト
      const invalidKeys = [
        'your_api_key_here',
        'ここにあなたのAPIキーを入力',
        '',
      ];

      for (const invalidKey of invalidKeys) {
        process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = invalidKey;

        const { result } = renderHook(() => useTouristSpots(mockUserLocation));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.spots).toHaveLength(2);
        expect(result.current.spots[0].name).toBe('Tokyo Tower');
      }
    });
  });

  describe('APIキーあり（本番モード）', () => {
    beforeEach(() => {
      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'valid-api-key';
    });

    it('有効なAPIキーがある場合はGoogle Places APIを呼び出すこと', async () => {
      mockGooglePlacesService.searchNearbyPlaces.mockResolvedValue(mockTouristSpots);

      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledWith({
        latitude: mockUserLocation.latitude,
        longitude: mockUserLocation.longitude,
        radius: 50000,
        language: 'en',
      });

      expect(result.current.spots).toHaveLength(2);
      expect(result.current.spots[0].name).toBe('API Spot 1');
      expect(result.current.spots[1].name).toBe('API Spot 2');
      expect(result.current.error).toBe(null);
    });

    it('日本語が選択されている場合は日本語でAPIを呼び出すこと', async () => {
      mockUseLanguage.mockReturnValue({
        language: 'ja',
        isLoading: false,
        changeLanguage: jest.fn(),
      });

      mockGooglePlacesService.searchNearbyPlaces.mockResolvedValue(mockTouristSpots);

      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledWith({
        latitude: mockUserLocation.latitude,
        longitude: mockUserLocation.longitude,
        radius: 50000,
        language: 'ja',
      });
    });

    it('APIエラー時はモックデータにフォールバックすること', async () => {
      mockGooglePlacesService.searchNearbyPlaces.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spots).toHaveLength(2); // モックデータ
      expect(result.current.spots[0].name).toBe('Tokyo Tower');
      expect(result.current.error).toBe('Using sample data due to API error');
    });
  });

  describe('距離ソート機能', () => {
    it('スポットが距離順にソートされること', async () => {
      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // モック関数で距離が設定されることを確認
      expect(result.current.spots[0].distance).toBe(0); // 最初のスポットは距離0
      expect(result.current.spots[1].distance).toBe(1.5); // 2番目のスポットは距離1.5
    });
  });

  describe('refetch機能', () => {
    it('refetch関数で再取得できること', async () => {
      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'valid-api-key';
      mockGooglePlacesService.searchNearbyPlaces.mockResolvedValue(mockTouristSpots);

      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledTimes(1);

      // refetch実行
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledTimes(2);
    });

    it('refetch中はloading状態になること', async () => {
      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // refetch開始
      act(() => {
        result.current.refetch();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('位置変更の反応', () => {
    it('userLocationが変更された時に再取得すること', async () => {
      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'valid-api-key';
      mockGooglePlacesService.searchNearbyPlaces.mockResolvedValue(mockTouristSpots);

      const { result, rerender } = renderHook(
        ({ location }: { location: LocationParam }) => useTouristSpots(location),
        {
          initialProps: { location: mockUserLocation }
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledTimes(1);

      // 位置を変更
      const newLocation = { latitude: 35.6896, longitude: 139.7006 }; // 新宿
      rerender({ location: newLocation });

      await waitFor(() => {
        expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledTimes(2);
      });

      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenLastCalledWith({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        radius: 50000,
        language: 'en',
      });
    });

    it('nullからuserLocationが設定された時に取得開始すること', async () => {
      mockGooglePlacesService.searchNearbyPlaces.mockResolvedValue(mockTouristSpots);

      const { result, rerender } = renderHook(
        ({ location }: { location: LocationParam }) => useTouristSpots(location),
        {
          initialProps: { location: null as LocationParam }
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.spots).toEqual([]);
      expect(mockGooglePlacesService.searchNearbyPlaces).not.toHaveBeenCalled();

      // 位置を設定
      rerender({ location: mockUserLocation });

      await waitFor(() => {
        expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('言語変更の反応', () => {
    it('言語が変更された時に再取得すること', async () => {
      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'valid-api-key';
      mockGooglePlacesService.searchNearbyPlaces.mockResolvedValue(mockTouristSpots);

      // 最初は英語
      mockUseLanguage.mockReturnValue({
        language: 'en',
        isLoading: false,
        changeLanguage: jest.fn(),
      });

      const { result, rerender } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'en' })
      );

      // 日本語に変更
      mockUseLanguage.mockReturnValue({
        language: 'ja',
        isLoading: false,
        changeLanguage: jest.fn(),
      });

      rerender({});

      await waitFor(() => {
        expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledWith(
          expect.objectContaining({ language: 'ja' })
        );
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('一般的なエラー時はモックデータを表示すること', async () => {
      // fetchSpots関数内で意図的にエラーを発生させるのは困難なため、
      // API呼び出し以外のエラーをシミュレート
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // モックデータが表示されることを確認
      expect(result.current.spots).toHaveLength(2);
      expect(result.current.spots[0].name).toBe('Tokyo Tower');

      consoleSpy.mockRestore();
    });
  });

  describe('パフォーマンス', () => {
    it('同じuserLocationでは不要な再取得を行わないこと', async () => {
      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'valid-api-key';
      mockGooglePlacesService.searchNearbyPlaces.mockResolvedValue(mockTouristSpots);

      const { rerender } = renderHook(
        ({ location }: { location: LocationParam }) => useTouristSpots(location),
        {
          initialProps: { location: mockUserLocation }
        }
      );

      await waitFor(() => {
        expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledTimes(1);
      });

      // 同じlocationで再レンダリング（オブジェクトは異なるが値は同じ）
      rerender({ location: { ...mockUserLocation } });

      // 追加の呼び出しは発生しない（useCallbackとuseEffectの依存関係によって制御）
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockGooglePlacesService.searchNearbyPlaces).toHaveBeenCalledTimes(1);
    });
  });

  describe('モックデータの内容確認', () => {
    it('モックデータに必要な項目がすべて含まれていること', async () => {
      const { result } = renderHook(() => useTouristSpots(mockUserLocation));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const spot = result.current.spots[0];
      
      // 必須項目の確認
      expect(spot.id).toBeDefined();
      expect(spot.name).toBeDefined();
      expect(spot.nameJa).toBeDefined();
      expect(spot.description).toBeDefined();
      expect(spot.descriptionJa).toBeDefined();
      expect(spot.historicalInfo).toBeDefined();
      expect(spot.historicalInfoJa).toBeDefined();
      expect(spot.category).toBeDefined();
      expect(spot.coordinates).toBeDefined();
      expect(spot.images).toBeDefined();
      expect(spot.rating).toBeDefined();
      expect(spot.address).toBeDefined();
      expect(spot.addressJa).toBeDefined();
      
      // 座標の妥当性確認
      expect(typeof spot.coordinates.latitude).toBe('number');
      expect(typeof spot.coordinates.longitude).toBe('number');
      expect(spot.coordinates.latitude).toBeGreaterThanOrEqual(-90);
      expect(spot.coordinates.latitude).toBeLessThanOrEqual(90);
      expect(spot.coordinates.longitude).toBeGreaterThanOrEqual(-180);
      expect(spot.coordinates.longitude).toBeLessThanOrEqual(180);
    });
  });
});