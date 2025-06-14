import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PermissionModal from './index';

describe('PermissionModal', () => {
  const mockOnRequestPermission = jest.fn();

  beforeEach(() => {
    mockOnRequestPermission.mockClear();
  });

  it('renders correctly in English', () => {
    const { getByText, getAllByText } = render(
      <PermissionModal language="en" onRequestPermission={mockOnRequestPermission} />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('Allow the app to access your location to show nearby tourist spots')).toBeTruthy();
    const enableButtons = getAllByText('Enable Location');
    expect(enableButtons).toHaveLength(2); // Title and button
  });

  it('renders correctly in Japanese', () => {
    const { getByText, getAllByText } = render(
      <PermissionModal language="ja" onRequestPermission={mockOnRequestPermission} />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('近くの観光スポットを表示するために位置情報へのアクセスを許可してください')).toBeTruthy();
    const enableButtons = getAllByText('位置情報を有効にする');
    expect(enableButtons).toHaveLength(2); // Title and button
  });

  it('calls onRequestPermission when button is pressed', () => {
    const { getAllByText } = render(
      <PermissionModal language="en" onRequestPermission={mockOnRequestPermission} />
    );

    const enableButtons = getAllByText('Enable Location');
    fireEvent.press(enableButtons[1]); // Press the button, not the title
    expect(mockOnRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('displays modal with correct animation and transparency', () => {
    const { UNSAFE_getByType } = render(
      <PermissionModal language="en" onRequestPermission={mockOnRequestPermission} />
    );

    const modal = UNSAFE_getByType('Modal' as any);
    expect(modal.props.animationType).toBe('slide');
    expect(modal.props.transparent).toBe(true);
    expect(modal.props.visible).toBe(true);
  });
});