import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './useLanguage';

// AsyncStorageのモックは jest.setup.js で設定済み

describe('useLanguage hook', () => {
  beforeEach(() => {
    // 各テスト前にAsyncStorageをクリア
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('初期化動作', () => {
    it('初期状態では英語設定でisLoadingがtrueであること', () => {
      const { result } = renderHook(() => useLanguage());
      
      expect(result.current.language).toBe('en');
      expect(result.current.isLoading).toBe(true);
      expect(typeof result.current.changeLanguage).toBe('function');
    });

    it('保存された言語がない場合はデフォルト（英語）のまま、isLoadingがfalseになること', async () => {
      // AsyncStorageが null を返すように設定
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('en');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@spot-go-explore:language');
    });

    it('保存された英語設定を正しく読み込むこと', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('en');
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('en');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@spot-go-explore:language');
    });

    it('保存された日本語設定を正しく読み込むこと', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('ja');
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('ja');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@spot-go-explore:language');
    });

    it('無効な言語設定が保存されている場合はデフォルト（英語）を使用すること', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('invalid-language');
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('en');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@spot-go-explore:language');
    });

    it('AsyncStorage読み込みエラー時はデフォルト（英語）を使用し、isLoadingがfalseになること', async () => {
      AsyncStorage.getItem = jest.fn().mockRejectedValue(new Error('AsyncStorage error'));
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('en');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@spot-go-explore:language');
    });
  });

  describe('changeLanguage 機能', () => {
    it('言語を英語から日本語に変更できること', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('en');
      AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useLanguage());
      
      // 初期読み込み完了を待つ
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('en');
      
      // 言語を日本語に変更
      await act(async () => {
        await result.current.changeLanguage('ja');
      });
      
      expect(result.current.language).toBe('ja');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@spot-go-explore:language', 'ja');
    });

    it('言語を日本語から英語に変更できること', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('ja');
      AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useLanguage());
      
      // 初期読み込み完了を待つ
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('ja');
      
      // 言語を英語に変更
      await act(async () => {
        await result.current.changeLanguage('en');
      });
      
      expect(result.current.language).toBe('en');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@spot-go-explore:language', 'en');
    });

    it('同じ言語に変更してもエラーが発生しないこと', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('en');
      AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('en');
      
      // 同じ言語（英語）に変更
      await act(async () => {
        await result.current.changeLanguage('en');
      });
      
      expect(result.current.language).toBe('en');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@spot-go-explore:language', 'en');
    });

    it('AsyncStorage保存エラー時はstate更新が実行されないこと', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('en');
      AsyncStorage.setItem = jest.fn().mockRejectedValue(new Error('AsyncStorage save error'));
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.language).toBe('en');
      
      // 保存エラーが発生した場合はstate更新は実行されない
      await act(async () => {
        await result.current.changeLanguage('ja');
      });
      
      // エラー時は言語は変更されない
      expect(result.current.language).toBe('en');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@spot-go-explore:language', 'ja');
    });
  });

  describe('複数回の言語変更', () => {
    it('連続して言語変更を実行できること', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('en');
      AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // 英語 → 日本語
      await act(async () => {
        await result.current.changeLanguage('ja');
      });
      expect(result.current.language).toBe('ja');
      
      // 日本語 → 英語
      await act(async () => {
        await result.current.changeLanguage('en');
      });
      expect(result.current.language).toBe('en');
      
      // 英語 → 日本語（再度）
      await act(async () => {
        await result.current.changeLanguage('ja');
      });
      expect(result.current.language).toBe('ja');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('ストレージキーの確認', () => {
    it('正しいAsyncStorageキーを使用していること', async () => {
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@spot-go-explore:language');
      
      await act(async () => {
        await result.current.changeLanguage('ja');
      });
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@spot-go-explore:language', 'ja');
    });
  });

  describe('フックの一意性', () => {
    it('複数のhookインスタンス間で状態が独立していること', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('en');
      AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);
      
      const { result: result1 } = renderHook(() => useLanguage());
      const { result: result2 } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });
      
      // 両方とも同じ初期状態
      expect(result1.current.language).toBe('en');
      expect(result2.current.language).toBe('en');
      
      // 片方だけ変更
      await act(async () => {
        await result1.current.changeLanguage('ja');
      });
      
      // 変更したhookのみ更新される
      expect(result1.current.language).toBe('ja');
      expect(result2.current.language).toBe('en'); // こちらは変更されない
    });
  });

  describe('パフォーマンス', () => {
    it('多数回の言語変更を適切な時間で処理できること', async () => {
      AsyncStorage.getItem = jest.fn().mockResolvedValue('en');
      AsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useLanguage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      const startTime = performance.now();
      
      // 100回の言語変更
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          await result.current.changeLanguage(i % 2 === 0 ? 'en' : 'ja');
        });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 100回の変更が1秒以内に完了することを期待
      expect(executionTime).toBeLessThan(1000);
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(100);
    });
  });
});