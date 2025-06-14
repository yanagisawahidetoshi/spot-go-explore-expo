/**
 * Wikimedia Commons API Service
 * 画像やメディアファイルの取得を担当
 */

export interface WikimediaImage {
  title: string;
  url: string;
  thumbUrl?: string;
  width: number;
  height: number;
  mime: string;
  descriptionUrl: string;
}

export interface GeoSearchResult {
  pageid: number;
  title: string;
  lat: number;
  lon: number;
  dist: number;
  primary?: string;
}

export class WikimediaCommonsService {
  private static readonly BASE_URL = 'https://commons.wikimedia.org/w/api.php';

  /**
   * Wikipediaページから使用されている画像を取得
   */
  static async getImagesFromWikipediaPage(
    pageTitle: string,
    language: 'ja' | 'en' = 'ja'
  ): Promise<WikimediaImage[]> {
    try {
      const wikiBaseUrl = language === 'ja' 
        ? 'https://ja.wikipedia.org/w/api.php'
        : 'https://en.wikipedia.org/w/api.php';

      // 1. ページで使用されている画像ファイル名を取得
      const imagesUrl = `${wikiBaseUrl}?action=query&format=json&prop=images&titles=${encodeURIComponent(pageTitle)}&imlimit=10&origin=*`;
      const imagesResponse = await fetch(imagesUrl);
      const imagesData = await imagesResponse.json();

      const pages = imagesData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1' || !pages[pageId].images) {
        return [];
      }

      const imageFiles = pages[pageId].images || [];
      
      // 2. 各画像の詳細情報を取得
      const imagePromises = imageFiles
        .filter((img: any) => {
          // ロゴやアイコンなどを除外
          const title = img.title.toLowerCase();
          return !title.includes('commons-logo') && 
                 !title.includes('.svg') &&
                 !title.includes('edit-icon') &&
                 !title.includes('wikimedia');
        })
        .slice(0, 5) // 最大5枚まで
        .map((img: any) => this.getImageDetails(img.title));

      const images = await Promise.all(imagePromises);
      return images.filter((img): img is WikimediaImage => img !== null);
    } catch (error) {
      console.error('Error fetching images from Wikipedia:', error);
      return [];
    }
  }

  /**
   * 画像ファイルの詳細情報とURLを取得
   */
  static async getImageDetails(fileName: string): Promise<WikimediaImage | null> {
    try {
      const url = `${this.BASE_URL}?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=800&titles=${encodeURIComponent(fileName)}&origin=*`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1' || !pages[pageId].imageinfo) {
        return null;
      }
      
      const imageInfo = pages[pageId].imageinfo[0];
      
      return {
        title: fileName,
        url: imageInfo.url,
        thumbUrl: imageInfo.thumburl,
        width: imageInfo.width,
        height: imageInfo.height,
        mime: imageInfo.mime,
        descriptionUrl: imageInfo.descriptionurl
      };
    } catch (error) {
      console.error('Error fetching image details:', error);
      return null;
    }
  }

  /**
   * 座標ベースで近くの画像を検索
   */
  static async searchNearbyImages(
    lat: number,
    lng: number,
    radius: number = 500
  ): Promise<GeoSearchResult[]> {
    try {
      const url = `${this.BASE_URL}?action=query&format=json&list=geosearch&gscoord=${lat}|${lng}&gsradius=${radius}&gslimit=20&gsprop=type|name|dim|country|region&origin=*`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.query?.geosearch || [];
    } catch (error) {
      console.error('Error searching nearby images:', error);
      return [];
    }
  }

  /**
   * カテゴリーから画像を検索（例：「日本の寺」）
   */
  static async searchImagesByCategory(category: string, limit: number = 10): Promise<WikimediaImage[]> {
    try {
      const url = `${this.BASE_URL}?action=query&format=json&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmtype=file&cmlimit=${limit}&cmprop=title|type&origin=*`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.query?.categorymembers) {
        return [];
      }

      const imagePromises = data.query.categorymembers
        .filter((member: any) => member.title.match(/\.(jpg|jpeg|png)$/i))
        .map((member: any) => this.getImageDetails(member.title));

      const images = await Promise.all(imagePromises);
      return images.filter((img): img is WikimediaImage => img !== null);
    } catch (error) {
      console.error('Error searching images by category:', error);
      return [];
    }
  }
}
