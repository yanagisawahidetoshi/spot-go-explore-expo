import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useLocationPermission } from '../../hooks/useLocationPermission';

jest.mock('expo-location');

describe('useLocationPermission hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no permission and no location', () => {
    const { result } = renderHook(() => useLocationPermission());
    
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.userLocation).toBeNull();
  });

  it('should request and obtain permission successfully', async () => {
    const mockLocation = {
      coords: {
        latitude: 35.6586,
        longitude: 139.7454,
      },
    };

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

    const { result } = renderHook(() => useLocationPermission());

    expect(result.current.hasPermission).toBe(false);

    await act(async () => {
      await result.current.requestPermission();
    });

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).toEqual({
        latitude: 35.6586,
        longitude: 139.7454,
      });
    });
  });

  it('should handle permission denial', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocationPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.userLocation).toBeNull();
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('should check existing permission on mount', async () => {
    const mockLocation = {
      coords: {
        latitude: 35.6586,
        longitude: 139.7454,
      },
    };

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

    const { result } = renderHook(() => useLocationPermission());

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).not.toBeNull();
    });
  });

  it('should handle location fetch errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
      new Error('Location unavailable')
    );

    const { result } = renderHook(() => useLocationPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
      expect(result.current.userLocation).toBeNull();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting location:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should use high accuracy for location', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 0, longitude: 0 },
    });

    const { result } = renderHook(() => useLocationPermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: Location.Accuracy.High,
    });
  });
});
