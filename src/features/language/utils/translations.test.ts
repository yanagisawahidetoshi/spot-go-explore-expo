import { t, translations, Language } from './translations';

describe('translations utils', () => {
  describe('translations object', () => {
    it('英語と日本語の翻訳辞書が存在すること', () => {
      expect(translations.en).toBeDefined();
      expect(translations.ja).toBeDefined();
      expect(typeof translations.en).toBe('object');
      expect(typeof translations.ja).toBe('object');
    });

    it('英語と日本語で同じキーが存在すること', () => {
      const enKeys = Object.keys(translations.en);
      const jaKeys = Object.keys(translations.ja);
      
      expect(enKeys.sort()).toEqual(jaKeys.sort());
    });

    it('ネストされたcategoriesオブジェクトが両言語に存在すること', () => {
      expect(translations.en.categories).toBeDefined();
      expect(translations.ja.categories).toBeDefined();
      
      const enCategoryKeys = Object.keys(translations.en.categories);
      const jaCategoryKeys = Object.keys(translations.ja.categories);
      
      expect(enCategoryKeys.sort()).toEqual(jaCategoryKeys.sort());
    });

    it('必須の翻訳キーが存在すること', () => {
      const requiredKeys = [
        'welcome',
        'appName', 
        'loading',
        'error',
        'back',
        'categories'
      ];
      
      requiredKeys.forEach(key => {
        expect(translations.en[key as keyof typeof translations.en]).toBeDefined();
        expect(translations.ja[key as keyof typeof translations.ja]).toBeDefined();
      });
    });
  });

  describe('t() function', () => {
    describe('基本的な翻訳機能', () => {
      it('単純なキーで英語の翻訳を取得できること', () => {
        expect(t('welcome', 'en')).toBe('Welcome to');
        expect(t('appName', 'en')).toBe('GO! SPOT');
        expect(t('loading', 'en')).toBe('Loading...');
      });

      it('単純なキーで日本語の翻訳を取得できること', () => {
        expect(t('welcome', 'ja')).toBe('ようこそ');
        expect(t('appName', 'ja')).toBe('GO! SPOT');
        expect(t('loading', 'ja')).toBe('読み込み中...');
      });

      it('デフォルト言語（英語）で翻訳を取得できること', () => {
        expect(t('welcome')).toBe('Welcome to');
        expect(t('appName')).toBe('GO! SPOT');
      });
    });

    describe('ネストされたキーの翻訳', () => {
      it('ネストされたキーで英語の翻訳を取得できること', () => {
        expect(t('categories.attraction', 'en')).toBe('Attractions');
        expect(t('categories.food', 'en')).toBe('Food');
        expect(t('categories.nature', 'en')).toBe('Nature');
      });

      it('ネストされたキーで日本語の翻訳を取得できること', () => {
        expect(t('categories.attraction', 'ja')).toBe('観光名所');
        expect(t('categories.food', 'ja')).toBe('グルメ');
        expect(t('categories.nature', 'ja')).toBe('自然');
      });

      it('深いネストされたキーが正しく処理されること', () => {
        // 既存の構造で最も深いネストをテスト
        expect(t('categories.shopping', 'en')).toBe('Shopping');
        expect(t('categories.shopping', 'ja')).toBe('ショッピング');
      });
    });

    describe('エラーハンドリングとフォールバック', () => {
      it('存在しないキーの場合はキー自体を返すこと', () => {
        expect(t('nonexistentKey', 'en')).toBe('nonexistentKey');
        expect(t('nonexistentKey', 'ja')).toBe('nonexistentKey');
        expect(t('nonexistentKey')).toBe('nonexistentKey');
      });

      it('存在しないネストされたキーの場合はキー自体を返すこと', () => {
        expect(t('categories.nonexistent', 'en')).toBe('categories.nonexistent');
        expect(t('nonexistent.category', 'en')).toBe('nonexistent.category');
        expect(t('categories.food.nonexistent', 'en')).toBe('categories.food.nonexistent');
      });

      it('部分的に存在するネストされたキーの場合はキー自体を返すこと', () => {
        expect(t('categories.food.subcategory', 'en')).toBe('categories.food.subcategory');
      });

      it('無効な言語コードでデフォルト動作すること', () => {
        // TypeScriptでは型エラーが出るが、実行時の動作をテスト
        expect(t('welcome', 'invalid' as Language)).toBe('welcome');
      });

      it('空文字列のキーを渡した場合の動作', () => {
        expect(t('', 'en')).toBe('');
        expect(t('', 'ja')).toBe('');
      });

      it('ドットのみのキーを渡した場合の動作', () => {
        expect(t('.', 'en')).toBe('.');
        expect(t('..', 'en')).toBe('..');
      });
    });

    describe('型安全性と一貫性', () => {
      it('すべての翻訳値が文字列であること', () => {
        const checkTranslationValues = (obj: any, path = ''): void => {
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof value === 'object' && value !== null) {
              checkTranslationValues(value, currentPath);
            } else {
              expect(typeof value).toBe('string');
              expect(value.length).toBeGreaterThan(0); // 空文字列でないこと
            }
          });
        };

        checkTranslationValues(translations.en);
        checkTranslationValues(translations.ja);
      });

      it('Language型が正しく定義されていること', () => {
        const validLanguages: Language[] = ['en', 'ja'];
        validLanguages.forEach(lang => {
          expect(translations[lang]).toBeDefined();
        });
      });
    });

    describe('実際の使用例のテスト', () => {
      it('アプリ内で頻繁に使用される翻訳が正しく動作すること', () => {
        // ヘッダー関連
        expect(t('nearbySpots', 'en')).toBe('GO! SPOT');
        expect(t('nearbySpots', 'ja')).toBe('GO! SPOT');

        // ボタン関連
        expect(t('directions', 'en')).toBe('Get Directions');
        expect(t('directions', 'ja')).toBe('道順を取得');

        // エラーメッセージ
        expect(t('cannotOpenMaps', 'en')).toBe('Cannot open maps');
        expect(t('cannotOpenMaps', 'ja')).toBe('地図を開けません');

        // カテゴリー
        expect(t('categories.culture', 'en')).toBe('Culture');
        expect(t('categories.culture', 'ja')).toBe('文化');
      });

      it('単位系の翻訳が正しく動作すること', () => {
        expect(t('km', 'en')).toBe('km');
        expect(t('km', 'ja')).toBe('km');
        expect(t('m', 'en')).toBe('m');
        expect(t('m', 'ja')).toBe('m');
      });

      it('UI状態の翻訳が正しく動作すること', () => {
        expect(t('loading', 'en')).toBe('Loading...');
        expect(t('loading', 'ja')).toBe('読み込み中...');
        expect(t('loadingMore', 'en')).toBe('Loading more...');
        expect(t('loadingMore', 'ja')).toBe('さらに読み込み中...');
      });
    });

    describe('パフォーマンステスト', () => {
      it('大量の翻訳呼び出しが適切な時間で処理されること', () => {
        const startTime = performance.now();
        
        // 1000回の翻訳呼び出し
        for (let i = 0; i < 1000; i++) {
          t('welcome', 'en');
          t('categories.attraction', 'ja');
          t('nonexistent.key', 'en');
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // 3000回の呼び出しが100ms以内に完了することを期待
        expect(executionTime).toBeLessThan(100);
      });
    });
  });
});