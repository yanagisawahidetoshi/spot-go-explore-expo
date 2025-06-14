// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TouristSpot } from '../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WikipediaSearchResult {
  pageid: number;
  title: string;
  extract: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WikipediaPageContent {
  pageid: number;
  title: string;
  extract: string;
  content?: string;
}

export class WikipediaService {
  private static readonly BASE_URL = 'https://ja.wikipedia.org/w/api.php';
  private static readonly EN_BASE_URL = 'https://en.wikipedia.org/w/api.php';

  static async searchSpotInfo(spotName: string, language: 'ja' | 'en' = 'ja'): Promise<string | null> {
    try {
      const baseUrl = language === 'ja' ? this.BASE_URL : this.EN_BASE_URL;
      
      // 1. まず検索して正確なページを見つける
      const searchUrl = `${baseUrl}?action=opensearch&format=json&search=${encodeURIComponent(spotName)}&limit=1&origin=*`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData[1] || searchData[1].length === 0) {

        return null;
      }

      const pageTitle = searchData[1][0];
      
      // 2. ページの詳細情報を取得
      const extractUrl = `${baseUrl}?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(pageTitle)}&origin=*`;
      const extractResponse = await fetch(extractUrl);
      const extractData = await extractResponse.json();
      
      const pages = extractData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1' || !pages[pageId].extract) {
        return null;
      }

      // 歴史的情報を抽出・整形
      let extract = pages[pageId].extract;
      
      // 長すぎる場合は要約
      if (extract.length > 500) {
        // 最初の2-3段落程度に制限
        const paragraphs = extract.split('\n').filter((p: string) => p.trim());
        extract = paragraphs.slice(0, 3).join('\n\n');
      }

      return extract;
    } catch {
      return null;
    }
  }

  // 観光スポット用の詳細な歴史情報を生成（現在は使用していません）
  static formatHistoricalInfo(wikiText: string | null, spotName: string, language: 'ja' | 'en'): string {
    if (!wikiText) {
      return '';
    }

    // 歴史的な年代や重要な情報を強調
    let formattedText = wikiText;
    
    // 年代情報を強調（例：1234年 → 西暦1234年）
    if (language === 'ja') {
      formattedText = formattedText.replace(/(\d{3,4})年/g, '西暦$1年');
    }

    return formattedText;
  }
}