export const translations = {
  en: {
    welcome: 'Welcome to',
    appName: 'Spot Go Explore',
    selectLanguage: 'Select Your Language',
    continue: 'Continue',
    locationPermission: 'Enable Location',
    locationPermissionDesc: 'Allow the app to access your location to show nearby tourist spots',
    enable: 'Enable Location',
    mapView: 'Map',
    listView: 'List',
    nearbySpots: 'Nearby Spots',
    loading: 'Loading...',
    noSpotsFound: 'No spots found nearby',
    details: 'Details',
    directions: 'Get Directions',
    call: 'Call',
    visitWebsite: 'Visit Website',
    openingHours: 'Opening Hours',
    price: 'Price',
    tips: 'Tips',
    features: 'Features',
    back: 'Back',
    settings: 'Settings',
    language: 'Language',
    english: 'English',
    japanese: '日本語',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    categories: {
      attraction: 'Attractions',
      food: 'Food',
      shopping: 'Shopping',
      nature: 'Nature',
      culture: 'Culture',
    },
    distance: 'Distance',
    rating: 'Rating',
    reviews: 'reviews',
    km: 'km',
    m: 'm',
  },
  ja: {
    welcome: 'ようこそ',
    appName: 'Spot Go Explore',
    selectLanguage: '言語を選択してください',
    continue: '続ける',
    locationPermission: '位置情報を有効にする',
    locationPermissionDesc: '近くの観光スポットを表示するために位置情報へのアクセスを許可してください',
    enable: '位置情報を有効にする',
    mapView: '地図',
    listView: 'リスト',
    nearbySpots: '近くのスポット',
    loading: '読み込み中...',
    noSpotsFound: '近くにスポットが見つかりません',
    details: '詳細',
    directions: '道順を取得',
    call: '電話する',
    visitWebsite: 'ウェブサイトを見る',
    openingHours: '営業時間',
    price: '料金',
    tips: 'アドバイス',
    features: '特徴',
    back: '戻る',
    settings: '設定',
    language: '言語',
    english: 'English',
    japanese: '日本語',
    close: '閉じる',
    search: '検索',
    filter: 'フィルター',
    categories: {
      attraction: '観光名所',
      food: 'グルメ',
      shopping: 'ショッピング',
      nature: '自然',
      culture: '文化',
    },
    distance: '距離',
    rating: '評価',
    reviews: 'レビュー',
    km: 'km',
    m: 'm',
  },
};

export type Language = keyof typeof translations;

export const t = (key: string, language: Language = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};