import { TouristSpot } from './spot';

export type RootStackParamList = {
  Home: undefined;
  SpotDetails: { spot: TouristSpot; language: 'en' | 'ja' };
};