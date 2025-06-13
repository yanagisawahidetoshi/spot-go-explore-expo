import { TouristSpot } from '../types';
import { WikipediaService } from './wikipedia';

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

interface PlaceSearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // meters
  language?: 'en' | 'ja';
}

interface GooglePlace {
  name: string;
  id: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri: string;
  websiteUri?: string;
  internationalPhoneNumber?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions?: string[];
  };
  priceLevel?: string;
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions?: Array<{
      displayName: string;
      uri: string;
      photoUri: string;
    }>;
  }>;
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: {
    text: string;
    languageCode: string;
  };
  editorialSummary?: {
    text: string;
    languageCode: string;
  };
}

// カテゴリマッピング
const mapGoogleTypeToCategory = (types: string[], primaryType?: string): TouristSpot['category'] => {
  const allTypes = [primaryType, ...(types || [])].filter(Boolean);
  
  // 観光地系のタイプを優先的にカテゴリ分けする
  if (allTypes.some(type => type?.includes('museum') || type?.includes('gallery'))) {
    return 'culture';
  }
  if (allTypes.some(type => type?.includes('park') || type?.includes('natural'))) {
    return 'nature';
  }
  if (allTypes.some(type => type?.includes('shopping'))) {
    return 'shopping';
  }
  // デフォルトは観光地
  return 'attraction';
};

// Google Placeから内部フォーマットに変換（Wikipedia情報付き）
const convertToTouristSpot = async (place: GooglePlace, language: 'en' | 'ja'): Promise<TouristSpot> => {
  // 写真URLの生成
  const images = place.photos?.slice(0, 3).map(photo => {
    // Places API (New) の写真URL形式
    return `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${GOOGLE_PLACES_API_KEY}`;
  }) || [];

  // デフォルト画像を追加（写真がない場合）
  if (images.length === 0) {
    images.push('https://via.placeholder.com/800x600?text=No+Image');
  }

  const displayName = place.displayName?.text || place.name || 'Unknown Place';
  const description = place.editorialSummary?.text || '';

  // Wikipedia情報を取得
  let historicalInfo = '';
  let historicalInfoJa = '';
  
  try {
    // 日本語の歴史情報を取得
    const wikiInfoJa = await WikipediaService.searchSpotInfo(displayName, 'ja');
    if (wikiInfoJa) {
      historicalInfoJa = wikiInfoJa;
    }
    
    // 英語の歴史情報を取得
    const wikiInfoEn = await WikipediaService.searchSpotInfo(displayName, 'en');
    if (wikiInfoEn) {
      historicalInfo = wikiInfoEn;
    }
  } catch (error) {

  }
  
  // Wikipediaの情報がない場合は、Google Places APIの説明を使用
  if (!historicalInfo) {
    historicalInfo = description;
  }
  if (!historicalInfoJa) {
    historicalInfoJa = description;
  }

  return {
    id: place.id || place.name,
    name: displayName,
    nameJa: displayName,
    description: description,
    descriptionJa: description,
    historicalInfo: historicalInfo,
    historicalInfoJa: historicalInfoJa,
    category: mapGoogleTypeToCategory(place.types || [], place.primaryType),
    coordinates: {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
    },
    images,
    rating: place.rating || 0,
    address: place.formattedAddress || '',
    addressJa: place.formattedAddress || '',
    openingHours: place.regularOpeningHours?.weekdayDescriptions?.join('\n') || '',
    openingHoursJa: place.regularOpeningHours?.weekdayDescriptions?.join('\n') || '',
    price: place.priceLevel ? `${'$'.repeat(parseInt(place.priceLevel.replace('PRICE_LEVEL_', '') || '1'))}` : '',
    priceJa: place.priceLevel ? `${'¥'.repeat(parseInt(place.priceLevel.replace('PRICE_LEVEL_', '') || '1'))}` : '',
    website: place.websiteUri || '',
    phone: place.internationalPhoneNumber || '',
    features: place.types?.slice(0, 3) || [],
    featuresJa: place.types?.slice(0, 3) || [],
  };
};

export class GooglePlacesService {
  static async searchNearbyPlaces(params: PlaceSearchParams): Promise<TouristSpot[]> {
    try {
      const { latitude, longitude, radius = 1000, language = 'en' } = params;



      // Places API (New) のエンドポイント
      const url = 'https://places.googleapis.com/v1/places:searchNearby';

      // 観光地系のタイプのみに限定（excludedTypesは使わない）
      const requestBody = {
        includedTypes: [
          'tourist_attraction',  // 観光地
          'museum',             // 博物館
          'art_gallery',        // 美術館
          'park',               // 公園
          'church',             // 教会
          'hindu_temple',       // ヒンドゥー寺院
          'mosque',             // モスク
          'synagogue',          // シナゴーグ
          'historical_landmark', // 歴史的建造物
          'zoo',                // 動物園
          'aquarium',           // 水族館
          'amusement_park'      // 遊園地
        ],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude
            },
            radius: radius
          }
        },
        languageCode: language === 'ja' ? 'ja' : 'en'
      };



      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
          'X-Goog-FieldMask': 'places.id,places.name,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.internationalPhoneNumber,places.regularOpeningHours,places.priceLevel,places.photos,places.types,places.primaryType,places.editorialSummary'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = JSON.parse(responseText);
      const places: GooglePlace[] = data.places || [];
      
      
      // 各場所について歴史情報も含めて変換（並列処理）
      const spotsPromises = places.map(place => convertToTouristSpot(place, language));
      const spots = await Promise.all(spotsPromises);

      return spots;
    } catch (error) {
      throw error;
    }
  }

  // 生のGoogle Place情報を取得するメソッド（内部使用）
  private static async getPlaceDetailsRaw(placeId: string, language: 'en' | 'ja' = 'en'): Promise<GooglePlace | null> {
    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
          'X-Goog-FieldMask': 'id,name,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,websiteUri,internationalPhoneNumber,regularOpeningHours,priceLevel,photos,types,primaryType,editorialSummary',
          'X-Goog-Language-Code': language === 'ja' ? 'ja' : 'en'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const place: GooglePlace = await response.json();
      return place;
    } catch (error) {
      return null;
    }
  }

  static async getPlaceDetails(placeId: string, language: 'en' | 'ja' = 'en'): Promise<TouristSpot | null> {
    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
          'X-Goog-FieldMask': 'id,name,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,websiteUri,internationalPhoneNumber,regularOpeningHours,priceLevel,photos,types,primaryType,editorialSummary',
          'X-Goog-Language-Code': language === 'ja' ? 'ja' : 'en'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`API request failed: ${response.status}`);
      }

      const place: GooglePlace = await response.json();
      return await convertToTouristSpot(place, language);
    } catch (error) {

      return null;
    }
  }
}