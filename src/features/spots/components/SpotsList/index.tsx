import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';

import { TouristSpot } from '../../types';
import { CATEGORIES } from '@/constants';
import { t, Language } from '@/features/language/utils/translations';
import { styles } from './styles';

interface Props {
  spots: TouristSpot[];
  loading: boolean;
  loadingMore?: boolean;
  language: Language;
  onSpotSelect: (spot: TouristSpot) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  selectedRadius?: number;
  onRadiusChange?: (radius: number) => void;
}

const RADIUS_OPTIONS = [
  { value: 1000, label: '1km' },
  { value: 10000, label: '10km' },
  { value: 50000, label: '50km' },
  { value: 100000, label: '100km' },
  { value: 300000, label: '300km' },
  { value: 500000, label: '500km' },
];

const SpotsList: React.FC<Props> = ({
  spots,
  loading,
  loadingMore = false,
  language,
  onSpotSelect,
  onLoadMore,
  hasMore = true,
  selectedRadius = 1000,
  onRadiusChange,
}) => {
  const renderSpotItem = ({ item }: { item: TouristSpot }) => {
    const name = language === 'ja' ? item.nameJa : item.name;
    const description = language === 'ja' ? item.descriptionJa : item.description;
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.spotCard,
          pressed && styles.spotCardPressed,
        ]}
        onPress={() => onSpotSelect(item)}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={styles.spotImage}
          contentFit="cover"
        />
        
        <View style={styles.spotContent}>
          <View style={styles.spotHeader}>
            <Text style={styles.spotName} numberOfLines={1}>
              {name}
            </Text>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: CATEGORIES[item.category].color }
            ]}>
              <Text style={styles.categoryIcon}>
                {item.category === 'attraction' ? '📸' :
                 item.category === 'food' ? '🍽️' :
                 item.category === 'shopping' ? '🛍️' :
                 item.category === 'nature' ? '🌳' :
                 item.category === 'culture' ? '🏛️' : '📍'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.spotDescription} numberOfLines={2}>
            {description}
          </Text>
          
          <View style={styles.spotFooter}>
            <View style={styles.ratingContainer}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
            
            {item.distance && (
              <Text style={styles.distance}>
                {item.distance < 1
                  ? `${Math.round(item.distance * 1000)}${t('m', language)}`
                  : `${item.distance.toFixed(1)}${t('km', language)}`
                }
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CATEGORIES.attraction.color} />
        <Text style={styles.loadingText}>{t('loading', language)}</Text>
      </View>
    );
  }

  if (spots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={styles.emptyText}>{t('noSpotsFound', language)}</Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={CATEGORIES.attraction.color} />
        <Text style={styles.footerText}>{t('loadingMore', language)}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!onRadiusChange) return null;
    return (
      <View style={styles.radiusSelector}>
        <Text style={styles.radiusSelectorTitle}>
          {language === 'ja' ? '検索範囲' : 'Search Range'}
        </Text>
        <View style={styles.radiusOptions}>
          {RADIUS_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.radiusButton,
                selectedRadius === option.value && styles.radiusButtonActive,
                pressed && styles.radiusButtonPressed,
              ]}
              onPress={() => onRadiusChange(option.value)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  selectedRadius === option.value && styles.radiusButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const handleEndReached = () => {
    if (onLoadMore && hasMore && !loadingMore) {
      onLoadMore();
    }
  };

  return (
    <FlatList
      data={spots}
      renderItem={renderSpotItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
    />
  );
};

export default SpotsList;