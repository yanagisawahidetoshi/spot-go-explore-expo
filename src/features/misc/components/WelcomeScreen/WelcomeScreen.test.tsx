import React from 'react';
import { render } from '@testing-library/react-native';
import WelcomeScreen from './index';

describe('WelcomeScreen', () => {
  it('renders correctly in English', () => {
    const { getByText } = render(
      <WelcomeScreen language="en" />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('Welcome to')).toBeTruthy();
    expect(getByText('GO! SPOT')).toBeTruthy();
    expect(getByText('Allow the app to access your location to show nearby tourist spots')).toBeTruthy();
  });

  it('renders correctly in Japanese', () => {
    const { getByText } = render(
      <WelcomeScreen language="ja" />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('ようこそ')).toBeTruthy();
    expect(getByText('GO! SPOT')).toBeTruthy();
    expect(getByText('近くの観光スポットを表示するために位置情報へのアクセスを許可してください')).toBeTruthy();
  });
});