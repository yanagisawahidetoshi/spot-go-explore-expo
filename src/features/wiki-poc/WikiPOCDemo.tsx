/**
 * Wiki Integration POC Demo Component
 * Wikipedia、Wikimedia Commons、Wikidataの統合デモ
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { EnhancedWikiService, EnhancedSpotInfo } from '@/features/spots/api/enhancedWikiService';

interface WikiPOCDemoProps {
  initialSearchQuery?: string;
}

export const WikiPOCDemo: React.FC<WikiPOCDemoProps> = ({ initialSearchQuery }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '清水寺');
  const [loading, setLoading] = useState(false);
  const [spotInfo, setSpotInfo] = useState<EnhancedSpotInfo | null>(null);
  const [audioScript, setAudioScript] = useState<string>('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('エラー', 'スポット名を入力してください');
      return;
    }

    setLoading(true);
    setSpotInfo(null);
    setAudioScript('');

    try {
      // 統合情報を取得
      const info = await EnhancedWikiService.getCompleteSpotInfo(
        searchQuery,
        undefined, // 座標は省略（実際のアプリでは現在地や選択したスポットの座標を使用）
        'ja'
      );
      
      setSpotInfo(info);
      
      // デバッグ用ログ
      console.log('SpotInfo:', {
        name: info.name,
        hasDescription: !!info.description,
        descriptionLength: info.description?.length,
        hasWikipediaExtract: !!info.wikipedia.extract,
        extractLength: info.wikipedia.extract?.length,
        extractPreview: info.wikipedia.extract?.substring(0, 100)
      });

      // 音声ガイドスクリプトを生成
      const script = EnhancedWikiService.generateAudioGuideScript(info, '90s');
      setAudioScript(script);
    } catch (error) {
      console.error('Error fetching spot info:', error);
      Alert.alert('エラー', '情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wiki統合POCデモ</Text>
        <Text style={styles.subtitle}>Wikipedia + Wikimedia Commons + Wikidata</Text>
      </View>

      {/* 検索セクション */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="観光スポット名を入力"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? '検索中...' : '検索'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ローディング表示 */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>情報を取得中...</Text>
        </View>
      )}

      {/* 結果表示 */}
      {spotInfo && !loading && (
        <View style={styles.resultsContainer}>
          {/* 基本情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本情報</Text>
            <Text style={styles.spotName}>{spotInfo.name}</Text>
            {/* 概要を表示：descriptionまたはwikipedia.extractの最初の部分 */}
            <Text style={styles.description}>
              {(() => {
                if (spotInfo.wikipedia.extract) {
                  const lines = spotInfo.wikipedia.extract.split('\n');
                  // 【概要】セクションを探す
                  const overviewIndex = lines.findIndex(line => line.includes('【概要】'));
                  if (overviewIndex !== -1 && lines[overviewIndex + 1]) {
                    return lines[overviewIndex + 1];
                  }
                  // 【概要】がなければ最初の段落を使用
                  return lines.find(line => line.trim() && !line.includes('【')) || spotInfo.description || '';
                }
                // wikipedia.extractがない場合はdescriptionを使用
                return spotInfo.description || '説明がありません';
              })()}
            </Text>
          </View>

          {/* 構造化データ（Wikidata） */}
          {spotInfo.structuredData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wikidataからの構造化データ</Text>
              {spotInfo.structuredData.founded && (
                <Text style={styles.dataItem}>
                  🏛️ 設立: {spotInfo.structuredData.founded}
                </Text>
              )}
              {spotInfo.structuredData.architecturalStyle && (
                <Text style={styles.dataItem}>
                  🎨 建築様式: {spotInfo.structuredData.architecturalStyle}
                </Text>
              )}
              {spotInfo.structuredData.heritage && (
                <Text style={styles.dataItem}>
                  🏆 文化財: {spotInfo.structuredData.heritage}
                </Text>
              )}
              {spotInfo.structuredData.height && (
                <Text style={styles.dataItem}>
                  📏 高さ: {spotInfo.structuredData.height}m
                </Text>
              )}
              {spotInfo.structuredData.architect && (
                <Text style={styles.dataItem}>
                  👷 建築家: {spotInfo.structuredData.architect}
                </Text>
              )}
            </View>
          )}

          {/* Wikipedia情報 */}
          {spotInfo.wikipedia.extract && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wikipedia情報</Text>
              <Text style={styles.debugInfo}>
                取得文字数: {spotInfo.wikipedia.extract.length}文字
              </Text>
              {/* 【概要】セクションを除いた詳細情報を表示 */}
              <ScrollView style={styles.wikiExtractContainer}>
                <Text style={styles.wikiExtract}>
                  {(() => {
                    const lines = spotInfo.wikipedia.extract.split('\n');
                    let skipNext = false;
                    
                    return lines
                      .filter((line, index) => {
                        // 【概要】セクションとその内容をスキップ
                        if (line.includes('【概要】')) {
                          skipNext = true;
                          return false;
                        }
                        if (skipNext && line.trim() && !line.includes('【')) {
                          skipNext = false;
                          return false;
                        }
                        skipNext = false;
                        return true;
                      })
                      .join('\n')
                      .trim();
                  })()}
                </Text>
              </ScrollView>
              {spotInfo.wikipedia.url && (
                <Text style={styles.wikiLink}>
                  🔗 {spotInfo.wikipedia.url}
                </Text>
              )}
            </View>
          )}

          {/* 画像（Wikimedia Commons） */}
          {spotInfo.images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Wikimedia Commonsからの画像 ({spotInfo.images.length}枚)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {spotInfo.images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.thumbUrl || image.url }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <Text style={styles.imageCaption} numberOfLines={2}>
                      {image.title.replace('File:', '').replace(/\.[^/.]+$/, '')}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 音声ガイドスクリプト */}
          {audioScript && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>生成された音声ガイドスクリプト</Text>
              <View style={styles.audioScriptContainer}>
                <Text style={styles.audioScript}>{audioScript}</Text>
                <Text style={styles.audioScriptNote}>
                  ※ 実際のアプリではTTSで読み上げます
                </Text>
              </View>
            </View>
          )}

          {/* 観光情報 */}
          {spotInfo.tourism && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>観光情報</Text>
              {spotInfo.tourism.estimatedDuration && (
                <Text style={styles.dataItem}>
                  ⏱️ 見学時間: {spotInfo.tourism.estimatedDuration}
                </Text>
              )}
              {spotInfo.tourism.bestTimeToVisit && (
                <Text style={styles.dataItem}>
                  🌅 おすすめ時間: {spotInfo.tourism.bestTimeToVisit}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* サンプルクエリ */}
      <View style={styles.samplesSection}>
        <Text style={styles.sampleTitle}>試してみてください：</Text>
        {['清水寺', '金閣寺', '東京タワー', '富士山', '姫路城'].map((sample) => (
          <TouchableOpacity
            key={sample}
            style={styles.sampleButton}
            onPress={() => {
              setSearchQuery(sample);
              setSpotInfo(null);
            }}
          >
            <Text style={styles.sampleButtonText}>{sample}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  searchSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#999',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultsContainer: {
    padding: 15,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  spotName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  dataItem: {
    fontSize: 14,
    marginVertical: 5,
    color: '#555',
  },
  debugInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  wikiExtractContainer: {
    maxHeight: 400,
    marginTop: 5,
  },
  wikiExtract: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  wikiLink: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 10,
  },
  imageContainer: {
    marginRight: 10,
    width: 200,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  imageCaption: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  audioScriptContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  audioScript: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  audioScriptNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  samplesSection: {
    padding: 15,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sampleButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  sampleButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
