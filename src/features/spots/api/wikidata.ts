/**
 * Wikidata API Service
 * 構造化データの取得を担当
 */

export interface WikidataEntity {
  id: string;
  labels: {
    [lang: string]: {
      language: string;
      value: string;
    };
  };
  descriptions: {
    [lang: string]: {
      language: string;
      value: string;
    };
  };
  claims: {
    [property: string]: any[];
  };
}

export interface StructuredSpotData {
  wikidataId: string;
  name: string;
  description: string;
  founded?: string;          // 設立年
  height?: number;           // 高さ（メートル）
  area?: number;             // 面積（平方メートル）
  architect?: string;        // 建築家
  architecturalStyle?: string; // 建築様式
  heritage?: string;         // 世界遺産・文化財情報
  coordinates?: {
    lat: number;
    lng: number;
  };
  officialWebsite?: string;
  address?: string;
}

export class WikidataService {
  private static readonly BASE_URL = 'https://www.wikidata.org/w/api.php';
  
  /**
   * WikipediaページからWikidata IDを取得
   */
  static async getWikidataId(
    wikipediaTitle: string,
    language: string = 'ja'
  ): Promise<string | null> {
    try {
      const url = `${this.BASE_URL}?action=wbgetentities&format=json&sites=${language}wiki&titles=${encodeURIComponent(wikipediaTitle)}&props=info&origin=*`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const entities = Object.values(data.entities) as any[];
      if (entities.length > 0 && entities[0].id) {
        return entities[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error getting Wikidata ID:', error);
      return null;
    }
  }
  
  /**
   * Wikidataから構造化データを取得
   */
  static async getEntityData(wikidataId: string): Promise<WikidataEntity | null> {
    try {
      const url = `${this.BASE_URL}?action=wbgetentities&format=json&ids=${wikidataId}&props=labels|descriptions|claims&languages=ja|en&origin=*`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.entities[wikidataId] || null;
    } catch (error) {
      console.error('Error fetching Wikidata entity:', error);
      return null;
    }
  }

  /**
   * 観光スポット用の構造化データを抽出
   */
  static async getStructuredSpotData(
    wikidataId: string,
    language: 'ja' | 'en' = 'ja'
  ): Promise<StructuredSpotData | null> {
    try {
      const entity = await this.getEntityData(wikidataId);
      if (!entity) return null;

      const result: StructuredSpotData = {
        wikidataId: wikidataId,
        name: entity.labels[language]?.value || entity.labels.en?.value || '',
        description: entity.descriptions[language]?.value || entity.descriptions.en?.value || ''
      };

      // 各種プロパティを抽出
      const claims = entity.claims;

      // P571: 設立・建立年
      if (claims.P571?.[0]?.mainsnak?.datavalue?.value?.time) {
        const time = claims.P571[0].mainsnak.datavalue.value.time;
        result.founded = this.parseWikidataTime(time);
      }

      // P2048: 高さ
      if (claims.P2048?.[0]?.mainsnak?.datavalue?.value?.amount) {
        result.height = parseFloat(claims.P2048[0].mainsnak.datavalue.value.amount);
      }

      // P2046: 面積
      if (claims.P2046?.[0]?.mainsnak?.datavalue?.value?.amount) {
        result.area = parseFloat(claims.P2046[0].mainsnak.datavalue.value.amount);
      }

      // P84: 建築家
      if (claims.P84?.[0]?.mainsnak?.datavalue?.value?.id) {
        const architectId = claims.P84[0].mainsnak.datavalue.value.id;
        const architectEntity = await this.getEntityData(architectId);
        if (architectEntity) {
          result.architect = architectEntity.labels[language]?.value || architectEntity.labels.en?.value;
        }
      }

      // P149: 建築様式
      if (claims.P149?.[0]?.mainsnak?.datavalue?.value?.id) {
        const styleId = claims.P149[0].mainsnak.datavalue.value.id;
        const styleEntity = await this.getEntityData(styleId);
        if (styleEntity) {
          result.architecturalStyle = styleEntity.labels[language]?.value || styleEntity.labels.en?.value;
        }
      }

      // P1435: 文化財保護指定
      if (claims.P1435?.[0]?.mainsnak?.datavalue?.value?.id) {
        const heritageId = claims.P1435[0].mainsnak.datavalue.value.id;
        const heritageEntity = await this.getEntityData(heritageId);
        if (heritageEntity) {
          result.heritage = heritageEntity.labels[language]?.value || heritageEntity.labels.en?.value;
        }
      }

      // P625: 座標
      if (claims.P625?.[0]?.mainsnak?.datavalue?.value) {
        const coords = claims.P625[0].mainsnak.datavalue.value;
        result.coordinates = {
          lat: coords.latitude,
          lng: coords.longitude
        };
      }

      // P856: 公式ウェブサイト
      if (claims.P856?.[0]?.mainsnak?.datavalue?.value) {
        result.officialWebsite = claims.P856[0].mainsnak.datavalue.value;
      }

      // P6375: 所在地住所
      if (claims.P6375?.[0]?.mainsnak?.datavalue?.value?.text) {
        result.address = claims.P6375[0].mainsnak.datavalue.value.text;
      }

      return result;
    } catch (error) {
      console.error('Error extracting structured data:', error);
      return null;
    }
  }

  /**
   * Wikidataの時刻形式をパース
   */
  private static parseWikidataTime(time: string): string {
    // 例: "+1603-00-00T00:00:00Z" -> "1603年"
    const match = time.match(/^\+?(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      
      if (month === '00') {
        return `${year}年`;
      } else if (day === '00') {
        return `${year}年${parseInt(month)}月`;
      } else {
        return `${year}年${parseInt(month)}月${parseInt(day)}日`;
      }
    }
    return time;
  }

  /**
   * 座標から近くのWikidataエンティティを検索
   */
  static async searchNearbyEntities(
    lat: number,
    lng: number,
    radius: number = 1000
  ): Promise<any[]> {
    try {
      // WikidataのSPARQLエンドポイントを使用する方が適切ですが、
      // CORSの問題があるため、ここでは簡略化しています
      const url = `${this.BASE_URL}?action=query&format=json&list=geosearch&gscoord=${lat}|${lng}&gsradius=${radius}&gslimit=10&origin=*`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.query?.geosearch || [];
    } catch (error) {
      console.error('Error searching nearby entities:', error);
      return [];
    }
  }
}
