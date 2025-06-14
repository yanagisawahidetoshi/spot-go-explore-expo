/**
 * Enhanced Wiki Service
 * Wikipedia、Wikimedia Commons、Wikidataを統合した観光スポット情報取得サービス
 */

import { WikipediaService } from './wikipedia';
import { EnhancedWikipediaService } from './wikipediaEnhanced';
import { MobileWikipediaService } from './wikipediaMobile';
import { WikimediaCommonsService, WikimediaImage } from './wikimediaCommons';
import { WikidataService, StructuredSpotData } from './wikidata';

export interface EnhancedSpotInfo {
  // 基本情報
  name: string;
  description: string | null;

  // Wikipedia情報
  wikipedia: {
    extract: string | null;
    pageTitle: string | null;
    url: string | null;
  };

  // 画像情報
  images: WikimediaImage[];

  // 構造化データ（Wikidata）
  structuredData: StructuredSpotData | null;

  // 統合された歴史情報
  history: {
    founded?: string;
    historicalEvents?: string[];
    culturalSignificance?: string;
  };

  // 観光情報
  tourism: {
    bestTimeToVisit?: string;
    estimatedDuration?: string;
    nearbyAttractions?: string[];
  };
}

export class EnhancedWikiService {
  /**
   * スポット名と座標から総合的な情報を取得
   */
  static async getCompleteSpotInfo(
    spotName: string,
    coordinates?: { lat: number; lng: number },
    language: 'ja' | 'en' = 'ja'
  ): Promise<EnhancedSpotInfo> {
    console.log(`[EnhancedWikiService] Fetching info for: ${spotName}`);

    // 初期化
    const result: EnhancedSpotInfo = {
      name: spotName,
      description: null,
      wikipedia: {
        extract: null,
        pageTitle: null,
        url: null,
      },
      images: [],
      structuredData: null,
      history: {},
      tourism: {},
    };

    try {
      // 1. 詳細版Wikipedia APIを優先的に試す（最も詳細な情報）
      const detailedWikiInfo = await EnhancedWikipediaService.getDetailedInfo(spotName, language);
      
      if (detailedWikiInfo && (detailedWikiInfo.sections.length > 0 || detailedWikiInfo.description)) {
        console.log('[EnhancedWikiService] Detailed Wikipedia response:', {
          spotName,
          totalLength: detailedWikiInfo.totalLength,
          sectionsCount: detailedWikiInfo.sections.length,
          hasCoordinates: !!detailedWikiInfo.coordinates,
          categoriesCount: detailedWikiInfo.categories.length
        });
        
        // 詳細情報からコンテンツを構築
        const fullContent = this.buildFullContent(detailedWikiInfo);
        result.wikipedia.extract = fullContent;
        result.wikipedia.pageTitle = detailedWikiInfo.title;
        result.description = detailedWikiInfo.description || this.extractShortDescription(fullContent);
        
        // Wikipedia URLを構築
        const wikiLang = language === 'ja' ? 'ja' : 'en';
        result.wikipedia.url = `https://${wikiLang}.wikipedia.org/wiki/${encodeURIComponent(detailedWikiInfo.title)}`;
        
        // 座標情報があれば保存
        if (detailedWikiInfo.coordinates && !coordinates) {
          coordinates = {
            lat: detailedWikiInfo.coordinates.lat,
            lng: detailedWikiInfo.coordinates.lon
          };
        }
      }
      
      // 詳細版が失敗した場合はモバイル版を試す
      if (!result.wikipedia.extract) {
        const mobileWikiInfo = await MobileWikipediaService.getMobileSummary(spotName, language);
        if (mobileWikiInfo && mobileWikiInfo.extract) {
          console.log('[EnhancedWikiService] Mobile Wikipedia response:', {
            spotName,
            extractLength: mobileWikiInfo.extract.length,
            sectionsCount: mobileWikiInfo.sections.length,
            hasImage: !!mobileWikiInfo.lead_image_url,
          });

          const formattedContent = MobileWikipediaService.formatMobileContent(mobileWikiInfo);
          result.wikipedia.extract = formattedContent;
          result.wikipedia.pageTitle = mobileWikiInfo.title;
          result.description =
            mobileWikiInfo.description || this.extractShortDescription(formattedContent);

          const wikiLang = language === 'ja' ? 'ja' : 'en';
          result.wikipedia.url = `https://${wikiLang}.wikipedia.org/wiki/${encodeURIComponent(mobileWikiInfo.title)}`;

          // メイン画像があれば追加
          if (mobileWikiInfo.lead_image_url && result.images.length === 0) {
            result.images.push({
              title: mobileWikiInfo.title,
              url: mobileWikiInfo.lead_image_url,
              thumbUrl: mobileWikiInfo.lead_image_url,
              description: mobileWikiInfo.description,
            });
          }
        }
      }

      // それでもダメな場合は最終フォールバック：従来の方法
      if (!result.wikipedia.extract) {
        const wikiExtract = await WikipediaService.searchSpotInfo(spotName, language);
        if (wikiExtract) {
          const formattedExtract = WikipediaService.formatHistoricalInfo(
            wikiExtract,
            spotName,
            language
          );
          result.wikipedia.extract = formattedExtract;
          result.description = this.extractShortDescription(formattedExtract);

          const wikiLang = language === 'ja' ? 'ja' : 'en';
          result.wikipedia.url = `https://${wikiLang}.wikipedia.org/wiki/${encodeURIComponent(spotName)}`;
        }
      }

      // 2. WikipediaページタイトルからWikidata IDを取得
      const wikidataId = await this.findWikidataId(spotName, language);
      console.log(`[EnhancedWikiService] Wikidata ID: ${wikidataId}`);

      if (wikidataId) {
        // 3. Wikidataから構造化データを取得
        const structuredData = await WikidataService.getStructuredSpotData(wikidataId, language);
        if (structuredData) {
          result.structuredData = structuredData;

          // 歴史情報を統合
          if (structuredData.founded) {
            result.history.founded = structuredData.founded;
          }
          if (structuredData.heritage) {
            result.history.culturalSignificance = structuredData.heritage;
          }
        }
      }

      // 4. 画像を取得
      // まずWikipediaページから画像を取得
      const wikiImages = await WikimediaCommonsService.getImagesFromWikipediaPage(
        spotName,
        language
      );
      result.images = wikiImages;

      // 画像が少ない場合は座標ベースで追加検索
      if (coordinates && result.images.length < 3) {
        const nearbyImageResults = await WikimediaCommonsService.searchNearbyImages(
          coordinates.lat,
          coordinates.lng,
          500
        );

        // 近くの画像から追加で取得（既存と重複しないもの）
        for (const nearby of nearbyImageResults.slice(0, 5)) {
          if (result.images.length >= 5) break;

          const imageDetails = await WikimediaCommonsService.getImageDetails(nearby.title);
          if (imageDetails && !result.images.find(img => img.title === imageDetails.title)) {
            result.images.push(imageDetails);
          }
        }
      }

      // 5. 観光情報を生成（シンプルな実装）
      result.tourism = this.generateTourismInfo(result);

      console.log(`[EnhancedWikiService] Complete info fetched:`, {
        hasWikipedia: !!result.wikipedia.extract,
        imageCount: result.images.length,
        hasStructuredData: !!result.structuredData,
      });
    } catch (error) {
      console.error('[EnhancedWikiService] Error fetching complete info:', error);
    }

    return result;
  }

  /**
   * WikipediaページからWikidata IDを探す
   */
  private static async findWikidataId(
    spotName: string,
    language: 'ja' | 'en'
  ): Promise<string | null> {
    try {
      // まず正確な名前でWikidata IDを取得
      let wikidataId = await WikidataService.getWikidataId(spotName, language);

      if (!wikidataId) {
        // 名前のバリエーションを試す
        const variations = this.generateNameVariations(spotName, language);
        for (const variation of variations) {
          wikidataId = await WikidataService.getWikidataId(variation, language);
          if (wikidataId) break;
        }
      }

      return wikidataId;
    } catch (error) {
      console.error('Error finding Wikidata ID:', error);
      return null;
    }
  }

  /**
   * スポット名のバリエーションを生成
   */
  private static generateNameVariations(spotName: string, language: 'ja' | 'en'): string[] {
    const variations: string[] = [];

    if (language === 'ja') {
      // 日本語の場合
      variations.push(spotName.replace(/[（(].*[)）]/, '').trim()); // カッコ内を削除
      variations.push(spotName.replace(/\s+/g, '')); // スペースを削除

      // 一般的な接尾辞を試す
      if (!spotName.includes('寺') && !spotName.includes('神社') && !spotName.includes('城')) {
        variations.push(spotName + '寺');
        variations.push(spotName + '神社');
        variations.push(spotName + '城');
      }
    } else {
      // 英語の場合
      variations.push(spotName.replace(/\s*(Temple|Shrine|Castle|Museum|Park)$/i, '').trim());
      variations.push(spotName.replace(/^The\s+/i, '').trim());
    }

    return variations;
  }

  /**
   * 長い説明文から短い説明を抽出
   */
  private static extractShortDescription(wikiExtract: string): string {
    if (!wikiExtract) return '';

    // 最初の文または最初の100文字を取得
    const firstSentence = wikiExtract.match(/^[^。.!?！？]+[。.!?！？]/);
    if (firstSentence) {
      return firstSentence[0];
    }

    return wikiExtract.slice(0, 100) + '...';
  }

  /**
   * 観光情報を生成（将来的にはAIや他のデータソースから取得）
   */
  private static generateTourismInfo(info: EnhancedSpotInfo): EnhancedSpotInfo['tourism'] {
    const tourism: EnhancedSpotInfo['tourism'] = {};

    // 簡単な推定
    if (info.structuredData?.heritage) {
      tourism.estimatedDuration = '60-90分';
    } else {
      tourism.estimatedDuration = '30-45分';
    }

    // 寺社仏閣の場合の一般的な情報
    if (info.name.includes('寺') || info.name.includes('神社')) {
      tourism.bestTimeToVisit = '早朝または夕方（混雑を避けるため）';
    }

    return tourism;
  }

  /**
   * 音声ガイド用のストーリーを生成
   */
  static generateAudioGuideScript(
    info: EnhancedSpotInfo,
    duration: '30s' | '90s' | '3min' = '90s'
  ): string {
    const parts: string[] = [];

    // Wikipedia情報がある場合はそれをメインに
    if (info.wikipedia.extract) {
      // セクションマーカーを除去して読みやすく
      const cleanExtract = info.wikipedia.extract
        .replace(/【.*?】/g, '') // 【】を除去
        .replace(/\n\n/g, ' ') // 改行をスペースに
        .trim();

      if (duration === '30s') {
        // 30秒版：最初の2文と重要情報
        const sentences = cleanExtract.split('。');
        const intro = sentences.slice(0, 2).join('。') + '。';
        parts.push(intro);

        // 重要な情報を追加
        if (info.structuredData?.founded) {
          parts.push(`設立は${info.structuredData.founded}。`);
        }
        if (info.structuredData?.heritage) {
          parts.push(`${info.structuredData.heritage}に指定されています。`);
        }
      } else if (duration === '90s') {
        // 90秒版：最初の5文程度と構造化データ
        const sentences = cleanExtract.split('。');
        const mainContent = sentences.slice(0, 5).join('。') + '。';
        parts.push(mainContent);

        // 構造化データから追加情報
        if (info.structuredData) {
          if (info.structuredData.founded && !mainContent.includes(info.structuredData.founded)) {
            parts.push(`\n\n設立は${info.structuredData.founded}。`);
          }
          if (info.structuredData.architecturalStyle) {
            parts.push(`建築様式は${info.structuredData.architecturalStyle}。`);
          }
          if (info.structuredData.height) {
            parts.push(`高さは${info.structuredData.height}メートル。`);
          }
        }

        // 観光情報
        if (info.tourism.estimatedDuration) {
          parts.push(`\n\n見学時間の目安は${info.tourism.estimatedDuration}です。`);
        }
      } else {
        // 3分版：より詳細な情報
        const sentences = cleanExtract.split('。');
        const detailedContent = sentences.slice(0, 10).join('。') + '。';
        parts.push(detailedContent);

        // すべての構造化データを含める
        if (info.structuredData) {
          parts.push('\n\n【詳細情報】');
          if (info.structuredData.founded) {
            parts.push(`設立: ${info.structuredData.founded}`);
          }
          if (info.structuredData.architect) {
            parts.push(`設計者: ${info.structuredData.architect}`);
          }
          if (info.structuredData.architecturalStyle) {
            parts.push(`建築様式: ${info.structuredData.architecturalStyle}`);
          }
          if (info.structuredData.height) {
            parts.push(`高さ: ${info.structuredData.height}メートル`);
          }
          if (info.structuredData.area) {
            parts.push(`面積: ${info.structuredData.area}平方メートル`);
          }
          if (info.structuredData.heritage) {
            parts.push(`文化財: ${info.structuredData.heritage}`);
          }
        }
      }
    } else {
      // Wikipedia情報がない場合のフォールバック
      parts.push(`ここは${info.name}です。`);

      if (info.structuredData?.founded) {
        parts.push(`${info.structuredData.founded}に設立されました。`);
      }

      if (info.structuredData?.heritage) {
        parts.push(`${info.structuredData.heritage}に指定されています。`);
      }

      if (info.description) {
        parts.push(info.description);
      }

      if (info.tourism.estimatedDuration) {
        parts.push(`見学時間の目安は${info.tourism.estimatedDuration}です。`);
      }
    }

    return parts.join(' ');
  }

  /**
   * 詳細なWikipedia情報からフルコンテンツを構築
   */
  private static buildFullContent(detailedInfo: any): string {
    const parts: string[] = [];
    
    // 説明があればそれを最初に使用（HTMLタグを除去）
    if (detailedInfo.description) {
      // descriptionからHTMLタグを除去
      const cleanDescription = detailedInfo.description
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();
      
      if (cleanDescription) {
        parts.push('【概要】');
        parts.push(cleanDescription);
        parts.push('');
      }
    }
    
    // 導入部があれば追加
    if (detailedInfo.introduction && detailedInfo.introduction !== detailedInfo.description) {
      parts.push('【詳細】');
      parts.push(detailedInfo.introduction);
      parts.push('');
    }
    
    // 各セクション
    if (detailedInfo.sections && detailedInfo.sections.length > 0) {
      for (const section of detailedInfo.sections) {
        // レベルに応じてヘッダーを調整
        const headerPrefix = section.level === 2 ? '【' : '  ■';
        const headerSuffix = section.level === 2 ? '】' : '';
        
        parts.push(`${headerPrefix}${section.title}${headerSuffix}`);
        parts.push(section.content);
        parts.push('');
      }
    }
    
    // カテゴリ情報
    if (detailedInfo.categories && detailedInfo.categories.length > 0) {
      parts.push('【関連カテゴリ】');
      parts.push(detailedInfo.categories.slice(0, 5).join('、'));
    }
    
    return parts.join('\n');
  }
}
