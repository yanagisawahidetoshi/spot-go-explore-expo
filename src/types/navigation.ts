import { TouristSpot } from '@/features/spots/types';

export type RootStackParamList = {
  Home: undefined;
  SpotDetails: { spot: TouristSpot; language: 'en' | 'ja' };
};