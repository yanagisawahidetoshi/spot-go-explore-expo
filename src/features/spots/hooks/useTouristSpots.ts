import { useState, useEffect } from 'react';
import { TouristSpot } from '../types';
import { sortSpotsByDistance } from '@/features/location/utils/location';
import { GooglePlacesService } from '../api/googlePlaces';
import { useLanguage } from '@/features/language/hooks/useLanguage';

// フォールバック用のモックデータ（歴史情報付き）
const MOCK_SPOTS: TouristSpot[] = [
  {
    id: '1',
    name: 'Tokyo Tower',
    nameJa: '東京タワー',
    description: 'Iconic red and white tower offering city views & attractions',
    descriptionJa: '東京のシンボルとして知られる赤と白のタワー',
    historicalInfo: 'Tokyo Tower was built in 1958 as a broadcasting antenna. Standing at 333 meters tall, it was inspired by the Eiffel Tower but is 13 meters taller. It served as the primary television broadcasting antenna for the Tokyo area and became an iconic symbol of Japan\'s post-war rebirth and modernization.',
    historicalInfoJa: '東京タワーは1958年（昭和33年）に電波塔として建設されました。高さ333メートルで、エッフェル塔より13メートル高く設計されています。戦後復興と高度経済成長のシンボルとして、また関東地方の電波送信の要として重要な役割を果たしてきました。設計は内藤多仲によるもので、「塔博士」と呼ばれた彼の最高傑作です。',
    category: 'attraction',
    coordinates: { latitude: 35.6586, longitude: 139.7454 },
    images: ['https://images.unsplash.com/photo-1536098561742-ca998e48cbcc'],
    rating: 4.5,
    address: '4 Chome-2-8 Shibakoen, Minato City, Tokyo',
    addressJa: '東京都港区芝公園４丁目２−８',
    openingHours: '9:00 AM - 11:00 PM',
    openingHoursJa: '9:00 - 23:00',
    price: '¥1,200',
    priceJa: '￥1,200',
    website: 'https://www.tokyotower.co.jp',
    phone: '+81 3-3433-5111',
    features: ['Observatory deck', 'Night illumination', 'Shopping'],
    featuresJa: ['展望デッキ', '夜景', 'ショッピング'],
  },
  {
    id: '2',
    name: 'Senso-ji Temple',
    nameJa: '浅草寺',
    description: 'Ancient Buddhist temple with a massive lantern & shopping street',
    descriptionJa: '東京最古の寺院で、巨大な提灯と仲見世通りが有名',
    historicalInfo: 'Senso-ji is Tokyo\'s oldest temple, founded in 645 AD. According to legend, two fishermen found a statue of Kannon (the Buddhist goddess of mercy) in the Sumida River. The temple was built to honor this discovery. Throughout its history, it has been destroyed and rebuilt multiple times, including after the Great Kanto Earthquake of 1923 and World War II bombing in 1945.',
    historicalInfoJa: '浅草寺は西暦645年（大化元年）に創建された東京最古の寺院です。隅田川で漁をしていた檜前浜成・竹成兄弟が観音像を発見し、これを本尊として祀ったのが始まりとされています。源頼朝、北条氏、徳川家康など、歴代の権力者からも篤い信仰を受けました。1923年の関東大震災、1945年の東京大空襲で焼失しましたが、その都度再建され、今も多くの参拝者で賑わっています。',
    category: 'culture',
    coordinates: { latitude: 35.7148, longitude: 139.7967 },
    images: ['https://images.unsplash.com/photo-1545569341-9eb8b30979d9'],
    rating: 4.6,
    address: '2 Chome-3-1 Asakusa, Taito City, Tokyo',
    addressJa: '東京都台東区浅草２丁目３−１',
    openingHours: '6:00 AM - 5:00 PM',
    openingHoursJa: '6:00 - 17:00',
    price: 'Free',
    priceJa: '無料',
    website: 'https://www.senso-ji.jp',
    features: ['Historical architecture', 'Shopping street', 'Traditional festivals'],
    featuresJa: ['歴史的建築', '仲見世通り', '伝統的なお祭り'],
  },
];

interface LocationData {
  latitude: number;
  longitude: number;
}

export const useTouristSpots = (userLocation: LocationData | null) => {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (userLocation) {
      fetchSpots();
    }
  }, [userLocation, language]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userLocation) {
        setSpots([]);
        return;
      }

      let spotsData: TouristSpot[] = [];
      
      // APIキーの確認
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
      const hasValidApiKey = apiKey && !apiKey.includes('ここにあなたのAPIキー') && apiKey !== 'your_api_key_here';


      if (!hasValidApiKey) {
        // APIキーが設定されていない場合
        // API key not found or invalid, using mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // API呼び出しをシミュレート
        spotsData = MOCK_SPOTS;
      } else {
        // 本番モード：Google Places APIを使用
        try {

          spotsData = await GooglePlacesService.searchNearbyPlaces({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            radius: 50000, // 50km
            language: language as 'en' | 'ja'
          });

        } catch (apiError: any) {
          // APIエラー時はモックデータにフォールバック
          spotsData = MOCK_SPOTS;
          setError('Using sample data due to API error');
        }
      }
      
      // 距離でソート
      const sortedSpots = sortSpotsByDistance(spotsData, userLocation);
      setSpots(sortedSpots);
      
    } catch (err) {
      setError('Failed to fetch tourist spots');

      // エラー時もモックデータを表示
      setSpots(MOCK_SPOTS);
    } finally {
      setLoading(false);
    }
  };

  return { spots, loading, error, refetch: fetchSpots };
};