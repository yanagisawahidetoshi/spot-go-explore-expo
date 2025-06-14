import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MapView from './index';
import { TouristSpot } from '@/features/spots/types';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const MockMapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      fitToCoordinates: jest.fn(),
      animateToRegion: jest.fn(),
    }));
    return <View {...props} />;
  });
  MockMapView.displayName = 'MockMapView';
  const MockMarker = (props: any) => (
    <View {...props} onPress={props.onPress}>
      {props.children}
    </View>
  );
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

describe('MapView', () => {
  const mockUserLocation = {
    latitude: 35.6762,
    longitude: 139.6503,
  };

  const mockSpots: TouristSpot[] = [
    {
      id: '1',
      name: 'Test Spot 1',
      nameJa: 'テストスポット1',
      category: 'attraction',
      coordinates: { latitude: 35.6892, longitude: 139.6916 },
      rating: 4.5,
      images: ['https://example.com/image1.jpg'],
      address: 'Test Address',
      addressJa: 'テスト住所',
      openingHours: '9:00-17:00',
      openingHoursJa: '9:00-17:00',
      price: '$10',
      priceJa: '￥10',
      website: 'https://example.com',
      phone: '+81-3-1234-5678',
      features: ['feature1'],
      featuresJa: ['機能1'],
      description: 'Test description',
      descriptionJa: 'テスト説明',
      historicalInfo: '',
      historicalInfoJa: ''
    },
    {
      id: '2',
      name: 'Test Spot 2',
      nameJa: 'テストスポット2',
      category: 'food',
      coordinates: { latitude: 35.6584, longitude: 139.7015 },
      rating: 4.0,
      images: ['https://example.com/image2.jpg'],
      address: 'Test Address 2',
      addressJa: 'テスト住所２',
      openingHours: '8:00-18:00',
      openingHoursJa: '8:00-18:00',
      price: '$15',
      priceJa: '￥15',
      website: 'https://example2.com',
      phone: '+81-3-5678-1234',
      features: ['feature2'],
      featuresJa: ['機能2'],
      description: 'Another test',
      descriptionJa: '別のテスト',
      historicalInfo: '',
      historicalInfoJa: ''
    },
  ];

  const mockOnSpotSelect = jest.fn();

  beforeEach(() => {
    mockOnSpotSelect.mockClear();
  });

  it('renders loading state correctly', () => {
    const { getByText } = render(
      <MapView
        userLocation={mockUserLocation}
        spots={[]}
        loading={true}
        onSpotSelect={mockOnSpotSelect}
        language="en"
      />
    );

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders map with spots when not loading', () => {
    const { getByText } = render(
      <MapView
        userLocation={mockUserLocation}
        spots={mockSpots}
        loading={false}
        onSpotSelect={mockOnSpotSelect}
        language="en"
      />
    );

    // Check for marker icons
    expect(getByText('📸')).toBeTruthy();
    expect(getByText('🍽️')).toBeTruthy();
    
    // Check for center button
    expect(getByText('📍')).toBeTruthy();
  });

  it('calls onSpotSelect when marker is pressed', () => {
    const { getByText } = render(
      <MapView
        userLocation={mockUserLocation}
        spots={mockSpots}
        loading={false}
        onSpotSelect={mockOnSpotSelect}
        language="en"
      />
    );

    // Press on marker by finding its icon
    fireEvent.press(getByText('📸'));
    
    expect(mockOnSpotSelect).toHaveBeenCalledWith(mockSpots[0]);
  });

  it('renders correct icons for different categories', () => {
    const spotsWithAllCategories: TouristSpot[] = [
      { ...mockSpots[0], category: 'attraction' },
      { ...mockSpots[0], id: '2', category: 'food' },
      { ...mockSpots[0], id: '3', category: 'shopping' },
      { ...mockSpots[0], id: '4', category: 'nature' },
      { ...mockSpots[0], id: '5', category: 'culture' },
    ];

    const { getByText } = render(
      <MapView
        userLocation={mockUserLocation}
        spots={spotsWithAllCategories}
        loading={false}
        onSpotSelect={mockOnSpotSelect}
        language="en"
      />
    );

    expect(getByText('📸')).toBeTruthy();
    expect(getByText('🍽️')).toBeTruthy();
    expect(getByText('🛍️')).toBeTruthy();
    expect(getByText('🌳')).toBeTruthy();
    expect(getByText('🏛️')).toBeTruthy();
  });
});