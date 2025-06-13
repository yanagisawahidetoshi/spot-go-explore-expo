import { useState, useEffect } from 'react';
import { TouristSpot } from '@/types/spot';
import { sortSpotsByDistance } from '@/utils/location';

// Mock data - In a real app, this would come from an API
const MOCK_SPOTS: TouristSpot[] = [
  {
    id: '1',
    name: 'Tokyo Tower',
    nameJa: '東京タワー',
    description: 'Iconic red and white tower offering city views & attractions',
    descriptionJa: '東京のシンボルとして知られる赤と白のタワー',
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

  useEffect(() => {
    fetchSpots();
  }, [userLocation]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch data from an API based on user location
      let spotsData = MOCK_SPOTS;
      
      if (userLocation) {
        spotsData = sortSpotsByDistance(spotsData, userLocation);
      }
      
      setSpots(spotsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tourist spots');
      console.error('Error fetching spots:', err);
    } finally {
      setLoading(false);
    }
  };

  return { spots, loading, error, refetch: fetchSpots };
};