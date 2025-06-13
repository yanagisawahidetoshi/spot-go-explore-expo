import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LanguageSelector from '../../components/LanguageSelector';

describe('LanguageSelector component', () => {
  const mockOnLanguageSelect = jest.fn();

  beforeEach(() => {
    mockOnLanguageSelect.mockClear();
  });

  it('should render language selection screen', () => {
    const { getByText } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    expect(getByText('Select Your Language')).toBeTruthy();
    expect(getByText('言語を選択してください')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('日本語')).toBeTruthy();
  });

  it('should call onLanguageSelect with "en" when English is selected', () => {
    const { getByTestId } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    const englishButton = getByTestId('language-button-en');
    fireEvent.press(englishButton);

    expect(mockOnLanguageSelect).toHaveBeenCalledWith('en');
    expect(mockOnLanguageSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onLanguageSelect with "ja" when Japanese is selected', () => {
    const { getByTestId } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    const japaneseButton = getByTestId('language-button-ja');
    fireEvent.press(japaneseButton);

    expect(mockOnLanguageSelect).toHaveBeenCalledWith('ja');
    expect(mockOnLanguageSelect).toHaveBeenCalledTimes(1);
  });

  it('should display flag emojis for each language', () => {
    const { getByText } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    expect(getByText('🇺🇸')).toBeTruthy();
    expect(getByText('🇯🇵')).toBeTruthy();
  });

  it('should have proper container structure', () => {
    const { getByTestId } = render(
      <LanguageSelector onLanguageSelect={mockOnLanguageSelect} />
    );

    const container = getByTestId('language-selector-container');
    expect(container).toBeTruthy();
  });
});
