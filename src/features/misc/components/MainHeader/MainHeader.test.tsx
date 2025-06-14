import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MainHeader from './index';

describe('MainHeader', () => {
  const mockOnToggleView = jest.fn();
  const mockOnShowLanguageSelector = jest.fn();

  beforeEach(() => {
    mockOnToggleView.mockClear();
    mockOnShowLanguageSelector.mockClear();
  });

  it('renders correctly in English with map view', () => {
    const { getByText } = render(
      <MainHeader
        isMapView={true}
        onToggleView={mockOnToggleView}
        onShowLanguageSelector={mockOnShowLanguageSelector}
        language="en"
      />
    );

    expect(getByText('GO! SPOT')).toBeTruthy();
    expect(getByText('📋')).toBeTruthy(); // List icon when in map view
    expect(getByText('🌐')).toBeTruthy();
  });

  it('renders correctly in Japanese with list view', () => {
    const { getByText } = render(
      <MainHeader
        isMapView={false}
        onToggleView={mockOnToggleView}
        onShowLanguageSelector={mockOnShowLanguageSelector}
        language="ja"
      />
    );

    expect(getByText('GO! SPOT')).toBeTruthy();
    expect(getByText('🗺️')).toBeTruthy(); // Map icon when in list view
    expect(getByText('🌐')).toBeTruthy();
  });

  it('calls onToggleView when view toggle button is pressed', () => {
    const { getByText } = render(
      <MainHeader
        isMapView={true}
        onToggleView={mockOnToggleView}
        onShowLanguageSelector={mockOnShowLanguageSelector}
        language="en"
      />
    );

    fireEvent.press(getByText('📋'));
    expect(mockOnToggleView).toHaveBeenCalledTimes(1);
  });

  it('calls onShowLanguageSelector when language button is pressed', () => {
    const { getByText } = render(
      <MainHeader
        isMapView={true}
        onToggleView={mockOnToggleView}
        onShowLanguageSelector={mockOnShowLanguageSelector}
        language="en"
      />
    );

    fireEvent.press(getByText('🌐'));
    expect(mockOnShowLanguageSelector).toHaveBeenCalledTimes(1);
  });

  it('shows correct icon based on view mode', () => {
    const { getByText, rerender } = render(
      <MainHeader
        isMapView={true}
        onToggleView={mockOnToggleView}
        onShowLanguageSelector={mockOnShowLanguageSelector}
        language="en"
      />
    );

    expect(getByText('📋')).toBeTruthy();

    rerender(
      <MainHeader
        isMapView={false}
        onToggleView={mockOnToggleView}
        onShowLanguageSelector={mockOnShowLanguageSelector}
        language="en"
      />
    );

    expect(getByText('🗺️')).toBeTruthy();
  });
});