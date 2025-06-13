# Claude.md - プロジェクト概要

## プロジェクト情報

- **プロジェクト名**: GO! SPOT (spot-go-explore-expo)
- **パス**: `/Users/yanagisawahidetoshi/works/spot-go-explore-expo`
- **フレームワーク**: React Native (Expo)
- **開発言語**: TypeScript

## プロジェクトの目的

位置情報を基に周辺の観光スポットを発見し、音声ガイダンスで情報を提供する観光アプリ。言語の壁なく、効率的に周辺の観光スポットを発見・学習したい個人旅行者向け。

## 主要機能

1. **位置情報ベースのスポット発見**

   - 現在地から 50km 圏内の観光スポットを表示（最大 20 件）
   - 地図表示とリスト表示の切り替え可能

2. **音声読み上げ機能**

   - スポット詳細画面で自動的に音声読み上げ開始
   - 再生/一時停止、速度調整（0.75x, 1x, 1.25x）機能

3. **多言語対応**

   - 日本語・英語対応
   - 初回起動時に言語選択

4. **歴史情報の表示**
   - Wikipedia から歴史情報を取得
   - 取得できない場合は Google Places API の説明を表示

## 技術スタック

### フロントエンド

- React Native 0.74.x
- TypeScript 5.x
- React Navigation v6
- Redux Toolkit（状態管理）

### 主要ライブラリ

- react-native-maps（地図表示）
- expo-speech（音声読み上げ）
- expo-location（位置情報）
- react-native-safe-area-context
- react-native-gesture-handler

### API・サービス

- Google Places API (New)（観光スポット情報）
- Wikipedia API（歴史情報）
- Google Maps（地図表示）

## プロジェクト構造

```
src/
├── components/
│   ├── LanguageSelector.tsx
│   ├── MainHeaderSimple.tsx
│   ├── MapViewSimple.tsx
│   ├── PermissionModalSimple.tsx
│   ├── SpotsListSimple.tsx
│   └── WelcomeScreen.tsx
├── constants/
│   └── index.ts
├── hooks/
│   ├── useLanguage.ts
│   ├── useLocationPermission.ts
│   └── useTouristSpots.ts
├── screens/
│   ├── Index.tsx
│   └── SpotDetails.tsx
├── services/
│   ├── googlePlaces.ts
│   └── wikipedia.ts
├── types/
│   ├── navigation.ts
│   └── spot.ts
└── utils/
    ├── location.ts
    ├── storage.ts
    └── translations.ts
```

## 環境設定

`.env`ファイルに以下の環境変数を設定：

```
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 開発ルール

### TDD（テスト駆動開発）の強制

**絶対に TDD で開発すること！**

1. 新機能を追加する前に、必ずテストを先に書く
2. テストが失敗することを確認する（Red）
3. テストが通る最小限のコードを実装する（Green）
4. コードをリファクタリングする（Refactor）
5. すべての新規コード・修正には対応するテストが必須

### UIコンポーネントのルール

**Pressableを使用すること**

- TouchableOpacityは使用禁止
- すべてのタップ可能な要素はPressableを使用
- pressedスタイルを必ず実装し、ユーザーフィードバックを提供

例：
```tsx
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
  onPress={handlePress}
>
  <Text>Button</Text>
</Pressable>
```

## 実行方法

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npx expo start

# iOSシミュレーターで実行
npx expo start --ios

# Androidエミュレーターで実行
npx expo start --android

# テストの実行
npm test

# テストを監視モードで実行
npm test -- --watch

# カバレッジを表示
npm test -- --coverage
```

## 既知の制限事項

- Google Places API (New)は 1 回のリクエストで最大 20 件までしか返さない
- `editorialSummary`は現在英語のみ（API の制限）

## デバッグ情報

- API キーが正しく設定されていない場合は、モックデータが表示される
- 位置情報の権限が拒否された場合は、手動検索機能の提供を検討

## 参考リンク

- [Google Places API (New) Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
