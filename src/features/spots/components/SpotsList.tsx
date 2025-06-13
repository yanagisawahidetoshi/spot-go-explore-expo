import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { TouristSpot } from '../types';
import { Colors, CATEGORIES } from '@/constants';
import { t, Language } from '@/features/language/utils/translations';

interface SpotsListProps {
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

const SpotsList: React.FC<SpotsListProps> = ({
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
          resizeMode="cover"
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
                 item.category === 'nature' ? '🌳' : '🏛️'}
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
        <ActivityIndicator size="large" color={Colors.primary} />
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
        <ActivityIndicator size="small" color={Colors.primary} />
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  listContent: {
    padding: 16,
  },
  spotCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  spotImage: {
    width: '100%',
    height: 180,
  },
  spotContent: {
    padding: 16,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 12,
  },
  spotDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  spotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  radiusSelector: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  radiusSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  radiusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  radiusButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radiusButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  radiusButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  spotCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  radiusButtonPressed: {
    opacity: 0.8,
  },
});

export default SpotsList;