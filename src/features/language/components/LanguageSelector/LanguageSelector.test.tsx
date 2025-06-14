import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LanguageSelector from './index';

describe('LanguageSelector', () => {
  const mockOnLanguageSelect = jest.fn();

  beforeEach(() => {
    mockOnLanguageSelect.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    expect(getByText('Select Your Language')).toBeTruthy();
    expect(getByText('言語を選択してください')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('日本語')).toBeTruthy();
  });

  it('calls onLanguageSelect with "en" when English button is pressed', () => {
    const { getByTestId } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    fireEvent.press(getByTestId('language-button-en'));
    expect(mockOnLanguageSelect).toHaveBeenCalledWith('en');
  });

  it('calls onLanguageSelect with "ja" when Japanese button is pressed', () => {
    const { getByTestId } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    fireEvent.press(getByTestId('language-button-ja'));
    expect(mockOnLanguageSelect).toHaveBeenCalledWith('ja');
  });

  it('displays app name and logo', () => {
    const { getByText } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    expect(getByText('🗺️')).toBeTruthy();
    expect(getByText('Spot Go Explore')).toBeTruthy();
  });

  it('displays flag emojis for each language', () => {
    const { getByText } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    expect(getByText('🇺🇸')).toBeTruthy();
    expect(getByText('🇯🇵')).toBeTruthy();
  });
});