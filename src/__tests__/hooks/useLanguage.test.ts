import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../hooks/useLanguage';

beforeEach(() => {
  AsyncStorage.clear();
});

describe('useLanguage hook', () => {
  it('should initialize with null language and loading true', () => {
    const { result } = renderHook(() => useLanguage());
    
    expect(result.current.language).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should load stored language on mount', async () => {
    AsyncStorage.setItem('@language', 'ja');
    
    const { result } = renderHook(() => useLanguage());
    
    await waitFor(() => {
      expect(result.current.language).toBe('ja');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should default to en if no stored language', async () => {
    const { result } = renderHook(() => useLanguage());
    
    await waitFor(() => {
      expect(result.current.language).toBe('en');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should change language and persist to storage', async () => {
    const { result } = renderHook(() => useLanguage());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.changeLanguage('ja');
    });

    expect(result.current.language).toBe('ja');
    
    const storedLanguage = await AsyncStorage.getItem('@language');
    expect(storedLanguage).toBe('ja');
  });

  it('should handle storage errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    AsyncStorage.getItem = jest.fn().mockRejectedValue(new Error('Storage error'));
    
    const { result } = renderHook(() => useLanguage());
    
    await waitFor(() => {
      expect(result.current.language).toBe('en');
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should toggle between languages', async () => {
    const { result } = renderHook(() => useLanguage());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially 'en'
    expect(result.current.language).toBe('en');

    // Change to 'ja'
    await act(async () => {
      await result.current.changeLanguage('ja');
    });
    expect(result.current.language).toBe('ja');

    // Change back to 'en'
    await act(async () => {
      await result.current.changeLanguage('en');
    });
    expect(result.current.language).toBe('en');
  });
});
