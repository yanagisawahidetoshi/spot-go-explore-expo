import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SpotsList from './index';
import { TouristSpot } from '../../types';

describe('SpotsList', () => {
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
      distance: 1.5,
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
      distance: 0.5,
      historicalInfo: '',
      historicalInfoJa: ''
    },
  ];

  const mockOnSpotSelect = jest.fn();
  const mockOnLoadMore = jest.fn();
  const mockOnRadiusChange = jest.fn();

  beforeEach(() => {
    mockOnSpotSelect.mockClear();
    mockOnLoadMore.mockClear();
    mockOnRadiusChange.mockClear();
  });

  it('renders loading state correctly', () => {
    const { getByText } = render(
      <SpotsList
        spots={[]}
        loading={true}
        language="en"
        onSpotSelect={mockOnSpotSelect}
      />
    );

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders empty state when no spots', () => {
    const { getByText } = render(
      <SpotsList
        spots={[]}
        loading={false}
        language="en"
        onSpotSelect={mockOnSpotSelect}
      />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('No spots found nearby')).toBeTruthy();
  });

  it('renders spots list correctly in English', () => {
    const { getByText } = render(
      <SpotsList
        spots={mockSpots}
        loading={false}
        language="en"
        onSpotSelect={mockOnSpotSelect}
      />
    );

    expect(getByText('Test Spot 1')).toBeTruthy();
    expect(getByText('Test Spot 2')).toBeTruthy();
    expect(getByText('Test description')).toBeTruthy();
    expect(getByText('Another test')).toBeTruthy();
    expect(getByText('1.5km')).toBeTruthy();
    expect(getByText('500m')).toBeTruthy();
  });

  it('renders spots list correctly in Japanese', () => {
    const { getByText } = render(
      <SpotsList
        spots={mockSpots}
        loading={false}
        language="ja"
        onSpotSelect={mockOnSpotSelect}
      />
    );

    expect(getByText('テストスポット1')).toBeTruthy();
    expect(getByText('テストスポット2')).toBeTruthy();
    expect(getByText('テスト説明')).toBeTruthy();
    expect(getByText('別のテスト')).toBeTruthy();
  });

  it('calls onSpotSelect when spot is pressed', () => {
    const { getByText } = render(
      <SpotsList
        spots={mockSpots}
        loading={false}
        language="en"
        onSpotSelect={mockOnSpotSelect}
      />
    );

    fireEvent.press(getByText('Test Spot 1'));
    expect(mockOnSpotSelect).toHaveBeenCalledWith(mockSpots[0]);
  });

  it('renders radius selector when onRadiusChange is provided', () => {
    const { getByText } = render(
      <SpotsList
        spots={mockSpots}
        loading={false}
        language="en"
        onSpotSelect={mockOnSpotSelect}
        onRadiusChange={mockOnRadiusChange}
        selectedRadius={10000}
      />
    );

    expect(getByText('Search Range')).toBeTruthy();
    expect(getByText('1km')).toBeTruthy();
    expect(getByText('10km')).toBeTruthy();
    expect(getByText('50km')).toBeTruthy();
  });

  it('calls onRadiusChange when radius button is pressed', () => {
    const { getByText } = render(
      <SpotsList
        spots={mockSpots}
        loading={false}
        language="en"
        onSpotSelect={mockOnSpotSelect}
        onRadiusChange={mockOnRadiusChange}
        selectedRadius={10000}
      />
    );

    fireEvent.press(getByText('50km'));
    expect(mockOnRadiusChange).toHaveBeenCalledWith(50000);
  });

  it('displays correct category icons', () => {
    const { getByText } = render(
      <SpotsList
        spots={mockSpots}
        loading={false}
        language="en"
        onSpotSelect={mockOnSpotSelect}
      />
    );

    expect(getByText('📸')).toBeTruthy(); // attraction
    expect(getByText('🍽️')).toBeTruthy(); // food
  });
});