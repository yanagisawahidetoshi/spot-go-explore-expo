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

### Bulletproof React アーキテクチャ

本プロジェクトは[Bulletproof React](https://github.com/alan2207/bulletproof-react)の設計思想に基づいて構築されています。

#### 設計原則

1. **機能別モジュール構造**
   - 機能ごとに独立したディレクトリで管理
   - 各機能が自己完結し、高い凝集性を保つ
   - 機能間の結合度を最小限に抑える

2. **単方向の依存関係**
   - shared → features → app の方向でのみ依存を許可
   - 循環依存を防ぎ、コードベースの予測可能性を向上

3. **明確な責務分離**
   - components: UIの表示に関する責務
   - hooks: ビジネスロジックとステート管理
   - api: 外部サービスとの通信
   - types: 型定義
   - utils: 汎用的なユーティリティ関数

#### ディレクトリ構造

```
src/
├── config/              # アプリケーション設定
│   └── index.ts        # 設定値の定義
├── constants/          # 定数定義
│   └── index.ts
├── features/           # 機能別モジュール
│   ├── spots/          # スポット関連機能
│   │   ├── api/        # API通信層
│   │   ├── components/ # UIコンポーネント
│   │   ├── hooks/      # カスタムフック
│   │   ├── types/      # 型定義
│   │   └── index.ts    # 公開エクスポート
│   ├── language/       # 言語設定機能
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── index.ts
│   ├── location/       # 位置情報機能
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── index.ts
│   ├── map/            # 地図表示機能
│   │   ├── components/
│   │   └── index.ts
│   ├── audio/          # 音声再生機能
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   └── misc/           # その他の機能
│       ├── components/
│       └── index.ts
├── lib/                # 外部ライブラリの設定
├── providers/          # コンテキストプロバイダー
├── routes/             # ルーティング設定
│   └── index.tsx
├── screens/            # 画面コンポーネント
│   ├── Index.tsx
│   └── SpotDetails.tsx
├── test/               # テスト関連
└── types/              # グローバル型定義
    └── navigation.ts
```

#### インポートルール

- features内では相対パスを使用
- features間の参照は絶対パス（@/features/...）を使用
- 循環依存を防ぐため、featuresは他のfeaturesに依存可能だが、単方向性を保つ

#### 各featureの構成

各featureディレクトリは以下の構成を持つ：

```
feature-name/
├── api/         # API通信層（該当する場合）
├── components/  # UIコンポーネント
├── hooks/       # カスタムフック
├── types/       # 型定義
├── utils/       # ユーティリティ関数
└── index.ts     # 公開API（エクスポート）
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

**Props名の統一**

- すべてのコンポーネントのProps interfaceは「Props」で統一すること
- 具体的なコンポーネント名を含む命名は禁止

例：
```tsx
// ✅ 正しい
interface Props {
  title: string;
  onPress: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  // ...
};

// ❌ 間違い
interface MyComponentProps {
  title: string;
  onPress: () => void;
}
```

**expo-imageを使用すること**

- React NativeのImageコンポーネントは使用禁止
- すべての画像表示はexpo-imageのImageコンポーネントを使用
- resizeModeの代わりにcontentFitを使用

例：
```tsx
// ✅ 正しい
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
/>

// ❌ 間違い
import { Image } from 'react-native';

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode="cover"
/>
```

**expo-routerを使用すること**

- react-navigationは使用禁止
- すべてのナビゲーションはexpo-routerを使用
- ファイルベースルーティング（app/ディレクトリ構造）
- router.push、router.back、useLocalSearchParamsを使用

例：
```tsx
// ✅ 正しい
import { router, useLocalSearchParams } from 'expo-router';

// ナビゲーション
router.push({
  pathname: '/spot/[id]',
  params: { id: spot.id, spotData: JSON.stringify(spot) }
});

// パラメータ取得
const params = useLocalSearchParams();
const { id, spotData } = params;

// 戻る
router.back();

// ❌ 間違い
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('SpotDetails', { spot });
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
