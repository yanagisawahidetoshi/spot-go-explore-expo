import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useLocationPermission } from './useLocationPermission';

// Alertのモック
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// expo-locationのモック
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    High: 6,
  },
}));

const mockLocation = Location as jest.Mocked<typeof Location>;
const mockAlert = Alert as jest.Mocked<typeof Alert>;

describe('useLocationPermission hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトのモック設定
    mockLocation.getForegroundPermissionsAsync = jest.fn();
    mockLocation.requestForegroundPermissionsAsync = jest.fn();
    mockLocation.getCurrentPositionAsync = jest.fn();
    mockAlert.alert = jest.fn();
  });

  describe('初期化動作', () => {
    it('初期状態が正しく設定されること', () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({ 
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      const { result } = renderHook(() => useLocationPermission());

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.userLocation).toBe(null);
      expect(result.current.loading).toBe(true);
      expect(typeof result.current.requestPermission).toBe('function');
      expect(typeof result.current.checkPermission).toBe('function');
    });

    it('権限が既に許可されている場合、位置情報を取得すること', async () => {
      const mockLocationData = {
        coords: {
          latitude: 35.6812,
          longitude: 139.7671,
          altitude: null,
          accuracy: 5,
          heading: null,
          speed: null,
          altitudeAccuracy: null,
        },
        timestamp: Date.now(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).toEqual({
        latitude: 35.6812,
        longitude: 139.7671,
      });
      expect(mockLocation.getForegroundPermissionsAsync).toHaveBeenCalled();
      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
      });
    });

    it('権限が拒否されている場合、位置情報を取得しないこと', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.userLocation).toBe(null);
      expect(mockLocation.getForegroundPermissionsAsync).toHaveBeenCalled();
      expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('権限チェックエラー時は適切に処理されること', async () => {
      mockLocation.getForegroundPermissionsAsync.mockRejectedValue(new Error('Permission check error'));

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.userLocation).toBe(null);
      expect(mockLocation.getForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('requestPermission 機能', () => {
    it('権限リクエストが許可された場合、位置情報を取得すること', async () => {
      const mockLocationData = {
        coords: {
          latitude: 35.6896,
          longitude: 139.7006,
          altitude: null,
          accuracy: 10,
          heading: null,
          speed: null,
          altitudeAccuracy: null,
        },
        timestamp: Date.now(),
      };

      // 初期は権限なし
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      // 権限リクエストは許可
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission).toBe(false);

      // 権限をリクエスト
      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).toEqual({
        latitude: 35.6896,
        longitude: 139.7006,
      });
      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
      });
      expect(mockAlert.alert).not.toHaveBeenCalled();
    });

    it('権限リクエストが拒否された場合、アラートを表示すること', async () => {
      // 初期は権限なし
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      // 権限リクエストは拒否
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        granted: false,
        canAskAgain: false,
        expires: 'never'
      });

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.userLocation).toBe(null);
      expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Permission Denied',
        'Location permission is required to show nearby tourist spots.',
        [{ text: 'OK' }]
      );
    });

    it('権限リクエストエラー時はアラートを表示すること', async () => {
      // 初期は権限なし
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      mockLocation.requestForegroundPermissionsAsync.mockRejectedValue(new Error('Permission request error'));

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.hasPermission).toBe(false);
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to request location permission.',
        [{ text: 'OK' }]
      );
    });
  });

  describe('getCurrentLocation 機能', () => {
    it('現在地取得エラー時はアラートを表示すること', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockRejectedValue(new Error('Location error'));

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).toBe(null);
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to get current location. Please make sure location services are enabled.',
        [{ text: 'OK' }]
      );
    });

    it('権限ありの状態で現在地取得が成功すること', async () => {
      const mockLocationData = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          altitude: 10,
          accuracy: 3,
          heading: 45,
          speed: 0,
          altitudeAccuracy: 5,
        },
        timestamp: Date.now(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userLocation).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
      });
      expect(mockAlert.alert).not.toHaveBeenCalled();
    });
  });

  describe('checkPermission 機能', () => {
    it('手動で権限チェックを実行できること', async () => {
      // 初期は拒否状態
      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasPermission).toBe(false);

      // 権限が許可された状態に変更
      const mockLocationData = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
          altitude: null,
          accuracy: 8,
          heading: null,
          speed: null,
          altitudeAccuracy: null,
        },
        timestamp: Date.now(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      // 手動で権限チェック
      await act(async () => {
        await result.current.checkPermission();
      });

      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
      });
    });
  });

  describe('複数回の権限操作', () => {
    it('複数回の権限リクエストが正しく処理されること', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 1回目: 拒否
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.hasPermission).toBe(false);

      // 2回目: 許可
      const mockLocationData = {
        coords: {
          latitude: 35.6762,
          longitude: 139.6503,
          altitude: null,
          accuracy: 5,
          heading: null,
          speed: null,
          altitudeAccuracy: null,
        },
        timestamp: Date.now(),
      };

      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).toEqual({
        latitude: 35.6762,
        longitude: 139.6503,
      });
      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('エッジケース', () => {
    it('座標が0,0の場合も正しく処理されること', async () => {
      const mockLocationData = {
        coords: {
          latitude: 0,
          longitude: 0,
          altitude: null,
          accuracy: 1000,
          heading: null,
          speed: null,
          altitudeAccuracy: null,
        },
        timestamp: Date.now(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userLocation).toEqual({
        latitude: 0,
        longitude: 0,
      });
    });

    it('極端な座標値も正しく処理されること', async () => {
      const mockLocationData = {
        coords: {
          latitude: 90, // 北極
          longitude: -180, // 国際日付変更線
          altitude: 8848, // エベレスト
          accuracy: 1,
          heading: 359.9,
          speed: 100,
          altitudeAccuracy: 1,
        },
        timestamp: Date.now(),
      };

      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      const { result } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userLocation).toEqual({
        latitude: 90,
        longitude: -180,
      });
    });
  });

  describe('フックの独立性', () => {
    it('複数のhookインスタンス間で状態が独立していること', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        granted: false,
        canAskAgain: true,
        expires: 'never'
      });

      const { result: result1 } = renderHook(() => useLocationPermission());
      const { result: result2 } = renderHook(() => useLocationPermission());

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
        expect(result2.current.loading).toBe(false);
      });

      // 両方とも同じ初期状態
      expect(result1.current.hasPermission).toBe(false);
      expect(result2.current.hasPermission).toBe(false);

      // 片方だけ権限を許可（モック上で）
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted' as any,
        granted: true,
        canAskAgain: false,
        expires: 'never'
      });

      const mockLocationData = {
        coords: {
          latitude: 35.6812,
          longitude: 139.7671,
          altitude: null,
          accuracy: 5,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValue(mockLocationData);

      await act(async () => {
        await result1.current.requestPermission();
      });

      // 片方だけ変更される
      expect(result1.current.hasPermission).toBe(true);
      expect(result2.current.hasPermission).toBe(false);
    });
  });
});