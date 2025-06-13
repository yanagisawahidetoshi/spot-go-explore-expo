import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { TouristSpot } from '@/types/spot';
import { Colors, CATEGORIES } from '@/constants';
import { t, Language } from '@/utils/translations';

interface SpotsListProps {
  spots: TouristSpot[];
  loading: boolean;
  language: Language;
  onSpotSelect: (spot: TouristSpot) => void;
}

const SpotsList: React.FC<SpotsListProps> = ({
  spots,
  loading,
  language,
  onSpotSelect,
}) => {
  const renderSpotItem = ({ item }: { item: TouristSpot }) => {
    const name = language === 'ja' ? item.nameJa : item.name;
    const description = language === 'ja' ? item.descriptionJa : item.description;
    
    return (
      <TouchableOpacity
        style={styles.spotCard}
        onPress={() => onSpotSelect(item)}
        activeOpacity={0.8}
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
              <MaterialIcons
                name={CATEGORIES[item.category].icon as any}
                size={12}
                color="white"
              />
            </View>
          </View>
          
          <Text style={styles.spotDescription} numberOfLines={2}>
            {description}
          </Text>
          
          <View style={styles.spotFooter}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFA502" />
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
      </TouchableOpacity>
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
        <MaterialIcons name="location-off" size={60} color={Colors.text.light} />
        <Text style={styles.emptyText}>{t('noSpotsFound', language)}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={spots}
      renderItem={renderSpotItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
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
  emptyText: {
    marginTop: 16,
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
});

export default SpotsList;