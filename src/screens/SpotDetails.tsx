import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Speech from 'expo-speech';

import { RootStackParamList } from '@/types/navigation';
import { Colors } from '@/constants';
import { t } from '@/utils/translations';

type RouteProps = RouteProp<RootStackParamList, 'SpotDetails'>;

const SpotDetails = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { spot, language } = route.params;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  // 音声読み上げ用のテキストを生成（歴史情報のみ）
  const generateSpeechText = () => {
    const name = language === 'ja' ? spot.nameJa : spot.name;
    const historicalInfo = language === 'ja' ? spot.historicalInfoJa : spot.historicalInfo;
    
    // 歴史情報を中心とした読み上げテキスト
    let speechText = `${name}。\n\n`;
    
    if (historicalInfo) {
      speechText += historicalInfo;
    } else {
      // 歴史情報がない場合は基本的な説明
      const description = language === 'ja' ? spot.descriptionJa : spot.description;
      speechText += description || (language === 'ja' ? 
        'このスポットの詳細な歴史情報は現在取得できません。' : 
        'Detailed historical information for this spot is currently unavailable.');
    }
    
    return speechText;
  };

  // 画面表示時に自動で読み上げ開始
  useEffect(() => {
    // 少し遅延させてから読み上げ開始（UXの改善）
    const timer = setTimeout(() => {
      startSpeaking();
    }, 500);
    
    // クリーンアップ
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, []);

  const startSpeaking = async () => {
    const text = generateSpeechText();
    setIsSpeaking(true);
    
    await Speech.speak(text, {
      language: language === 'ja' ? 'ja-JP' : 'en-US',
      rate: speechRate,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      startSpeaking();
    }
  };

  const changeSpeechRate = () => {
    const newRate = speechRate === 0.75 ? 1.0 : speechRate === 1.0 ? 1.25 : 0.75;
    setSpeechRate(newRate);
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      setTimeout(() => startSpeaking(), 100);
    }
  };

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
  const historicalInfo = language === 'ja' ? spot.historicalInfoJa : spot.historicalInfo;
  const description = language === 'ja' ? spot.descriptionJa : spot.description;
  const address = language === 'ja' ? spot.addressJa : spot.address;
  const openingHours = language === 'ja' ? spot.openingHoursJa : spot.openingHours;
  const price = language === 'ja' ? spot.priceJa : spot.price;

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
          <Pressable 
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          
          {/* スポット名オーバーレイ */}
          <View style={styles.titleOverlay}>
            <Text style={styles.overlayTitle}>{name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.overlayRating}>{spot.rating}</Text>
            </View>
          </View>
        </View>

        {/* Audio Controls */}
        <View style={styles.audioControls}>
          <Pressable 
            style={({ pressed }) => [
              styles.audioButton,
              isSpeaking && styles.audioButtonActive,
              pressed && styles.audioButtonPressed,
            ]}
            onPress={toggleSpeech}
          >
            <Text style={styles.audioIcon}>{isSpeaking ? '⏸' : '▶️'}</Text>
            <Text style={styles.audioButtonText}>
              {isSpeaking ? 
                (language === 'ja' ? '一時停止' : 'Pause') : 
                (language === 'ja' ? '歴史を聞く' : 'Listen to History')
              }
            </Text>
          </Pressable>
          
          <Pressable 
            style={({ pressed }) => [
              styles.speedButton,
              pressed && styles.speedButtonPressed,
            ]}
            onPress={changeSpeechRate}
          >
            <Text style={styles.speedText}>{speechRate}x</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* 歴史情報セクション */}
          <View style={styles.historicalSection}>
            <Text style={styles.sectionTitle}>
              {language === 'ja' ? '歴史と背景' : 'History & Background'}
            </Text>
            
            {historicalInfo ? (
              <Text style={styles.historicalText}>{historicalInfo}</Text>
            ) : description ? (
              <Text style={styles.historicalText}>{description}</Text>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>
                  {language === 'ja' ? '歴史情報を取得中...' : 'Loading historical information...'}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                styles.primaryButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleGetDirections}
            >
              <Text style={styles.actionIcon}>🗺</Text>
              <Text style={styles.buttonTextPrimary}>
                {t('directions', language)}
              </Text>
            </Pressable>
            
            {spot.phone && (
              <Pressable 
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleCall}
              >
                <Text style={styles.actionIcon}>📞</Text>
                <Text style={styles.buttonText}>{t('call', language)}</Text>
              </Pressable>
            )}
            
            {spot.website && (
              <Pressable 
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleVisitWebsite}
              >
                <Text style={styles.actionIcon}>🌐</Text>
                <Text style={styles.buttonText}>{t('visitWebsite', language)}</Text>
              </Pressable>
            )}
          </View>

          {/* 基本情報セクション */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>
              {language === 'ja' ? '基本情報' : 'Basic Information'}
            </Text>
            
            {/* Address */}
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('address', language)}</Text>
                <Text style={styles.infoText}>{address}</Text>
              </View>
            </View>

            {/* Opening Hours */}
            {openingHours && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🕐</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('openingHours', language)}</Text>
                  <Text style={styles.infoText}>{openingHours}</Text>
                </View>
              </View>
            )}

            {/* Price */}
            {price && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>💰</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('price', language)}</Text>
                  <Text style={styles.infoText}>{price}</Text>
                </View>
              </View>
            )}
          </View>

          {/* 追加の画像があれば表示 */}
          {spot.images.length > 1 && (
            <View style={styles.additionalImages}>
              <Text style={styles.additionalImagesTitle}>
                {language === 'ja' ? 'その他の写真' : 'More Photos'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {spot.images.slice(1).map((image, index) => (
                  <Image 
                    key={index}
                    source={{ uri: image }} 
                    style={styles.additionalImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
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
    height: 300,
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
  backButtonText: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  overlayRating: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  audioButtonActive: {
    backgroundColor: Colors.secondary,
  },
  audioIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  audioButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  speedText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  historicalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  historicalText: {
    fontSize: 17,
    lineHeight: 28,
    color: Colors.text.primary,
    textAlign: 'justify',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
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
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  additionalImages: {
    marginBottom: 20,
  },
  additionalImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  additionalImage: {
    width: 200,
    height: 150,
    marginRight: 12,
    borderRadius: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  audioButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  speedButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default SpotDetails;