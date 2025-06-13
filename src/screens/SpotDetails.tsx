import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { RootStackParamList } from '@/types/navigation';
import { Colors, CATEGORIES } from '@/constants';
import { t } from '@/utils/translations';

type RouteProps = RouteProp<RootStackParamList, 'SpotDetails'>;

const SpotDetails = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { spot, language } = route.params;

  const handleGetDirections = () => {
    const { latitude, longitude } = spot.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t('error', language), t('cannotOpenMaps', language));
    });
  };

  const handleCall = () => {
    if (spot.phone) {
      Linking.openURL(`tel:${spot.phone}`).catch(() => {
        Alert.alert(t('error', language), t('cannotMakeCall', language));
      });
    }
  };

  const handleVisitWebsite = () => {
    if (spot.website) {
      Linking.openURL(spot.website).catch(() => {
        Alert.alert(t('error', language), t('cannotOpenWebsite', language));
      });
    }
  };

  const name = language === 'ja' ? spot.nameJa : spot.name;
  const description = language === 'ja' ? spot.descriptionJa : spot.description;
  const address = language === 'ja' ? spot.addressJa : spot.address;
  const openingHours = language === 'ja' ? spot.openingHoursJa : spot.openingHours;
  const price = language === 'ja' ? spot.priceJa : spot.price;
  const tips = language === 'ja' ? spot.tipsJa : spot.tips;
  const features = language === 'ja' ? spot.featuresJa : spot.features;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: spot.images[0] }} 
            style={styles.headerImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Category */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{name}</Text>
            <View style={styles.categoryBadge}>
              <MaterialIcons 
                name={CATEGORIES[spot.category].icon as any} 
                size={16} 
                color="white" 
              />
              <Text style={styles.categoryText}>
                {t(`categories.${spot.category}`, language)}
              </Text>
            </View>
          </View>

          {/* Rating and Distance */}
          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFA502" />
              <Text style={styles.rating}>{spot.rating}</Text>
            </View>
            {spot.distance && (
              <Text style={styles.distance}>
                {spot.distance < 1 
                  ? `${Math.round(spot.distance * 1000)}${t('m', language)}`
                  : `${spot.distance.toFixed(1)}${t('km', language)}`
                }
              </Text>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>{description}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleGetDirections}
            >
              <MaterialIcons name="directions" size={20} color="white" />
              <Text style={styles.buttonTextPrimary}>
                {t('directions', language)}
              </Text>
            </TouchableOpacity>
            
            {spot.phone && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCall}
              >
                <Ionicons name="call" size={20} color={Colors.primary} />
                <Text style={styles.buttonText}>{t('call', language)}</Text>
              </TouchableOpacity>
            )}
            
            {spot.website && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleVisitWebsite}
              >
                <Ionicons name="globe" size={20} color={Colors.primary} />
                <Text style={styles.buttonText}>{t('visitWebsite', language)}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Information Sections */}
          <View style={styles.infoSection}>
            {/* Address */}
            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={20} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{address}</Text>
            </View>

            {/* Opening Hours */}
            {openingHours && (
              <View style={styles.infoItem}>
                <MaterialIcons name="access-time" size={20} color={Colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('openingHours', language)}</Text>
                  <Text style={styles.infoText}>{openingHours}</Text>
                </View>
              </View>
            )}

            {/* Price */}
            {price && (
              <View style={styles.infoItem}>
                <MaterialIcons name="attach-money" size={20} color={Colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('price', language)}</Text>
                  <Text style={styles.infoText}>{price}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Features */}
          {features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('features', language)}</Text>
              <View style={styles.featuresList}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tips */}
          {tips && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tips', language)}</Text>
              <Text style={styles.tipsText}>{tips}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    fontSize: 14,
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text.primary,
  },
});

export default SpotDetails;