export interface TouristSpot {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  category: 'attraction' | 'food' | 'shopping' | 'nature' | 'culture';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  rating: number;
  distance?: number;
  address: string;
  addressJa: string;
  openingHours?: string;
  openingHoursJa?: string;
  price?: string;
  priceJa?: string;
  website?: string;
  phone?: string;
  tips?: string;
  tipsJa?: string;
  features: string[];
  featuresJa: string[];
}