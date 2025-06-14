/**
 * Enhanced Wikipedia Service
 * より詳細な情報を取得するための拡張版Wikipedia API
 */

export interface WikipediaSection {
  title: string;
  level: number;
  content: string;
}

export interface DetailedWikipediaInfo {
  title: string;
  pageId: number;
  description: string;
  introduction: string;
  sections: WikipediaSection[];
  categories: string[];
  coordinates?: {
    lat: number;
    lon: number;
  };
  images: Array<{
    title: string;
    url: string;
    thumbUrl?: string;
  }>;
  infobox?: Record<string, string>;
  totalLength: number;
}

export class EnhancedWikipediaService {
  private static readonly BASE_URL = 'https://ja.wikipedia.org/w/api.php';
  private static readonly EN_BASE_URL = 'https://en.wikipedia.org/w/api.php';

  /**
   * 複数のAPIを組み合わせて詳細な情報を取得
   */
  static async getDetailedInfo(spotName: string, language: 'ja' | 'en' = 'ja'): Promise<DetailedWikipediaInfo | null> {
    try {
      const baseUrl = language === 'ja' ? this.BASE_URL : this.EN_BASE_URL;
      
      // 1. ページの基本情報を取得
      const searchUrl = `${baseUrl}?action=query&format=json&list=search&srsearch=${encodeURIComponent(spotName)}&srlimit=1&origin=*`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.query?.search?.[0]) {
        console.log('No search results found');
        return null;
      }

      const pageInfo = searchData.query.search[0];
      const pageTitle = pageInfo.title;
      const pageId = pageInfo.pageid;

      console.log(`Found page: ${pageTitle} (ID: ${pageId})`);

      // 2. 複数のプロパティを一度に取得
      const detailUrl = `${baseUrl}?action=query&format=json&pageids=${pageId}&prop=extracts|categories|coordinates|pageimages&exlimit=max&explaintext=true&exsectionformat=plain&cllimit=50&pilimit=50&origin=*`;
      const detailResponse = await fetch(detailUrl);
      const detailData = await detailResponse.json();
      
      const page = detailData.query.pages[pageId];
      
      if (!page) {
        console.log('Page details not found');
        return null;
      }

      // 3. セクションごとの詳細を取得
      const sectionsUrl = `${baseUrl}?action=parse&format=json&pageid=${pageId}&prop=sections|text&origin=*`;
      const sectionsResponse = await fetch(sectionsUrl);
      const sectionsData = await sectionsResponse.json();

      // 4. 各セクションの内容を個別に取得
      const sections: WikipediaSection[] = [];
      if (sectionsData.parse?.sections) {
        for (const section of sectionsData.parse.sections.slice(0, 10)) { // 最初の10セクションまで
          if (section.index && section.line) {
            const sectionContent = await this.getSectionContent(pageId, section.index, baseUrl);
            if (sectionContent) {
              sections.push({
                title: section.line,
                level: parseInt(section.level),
                content: sectionContent
              });
            }
          }
        }
      }

      // 5. 結果を整形
      const result: DetailedWikipediaInfo = {
        title: pageTitle,
        pageId: pageId,
        description: pageInfo.snippet ? this.stripHtml(pageInfo.snippet) : '',
        introduction: this.extractIntroduction(page.extract || ''),
        sections: sections,
        categories: page.categories ? page.categories.map(cat => cat.title.replace('Category:', '')) : [],
        coordinates: page.coordinates?.[0] ? {
          lat: page.coordinates[0].lat,
          lon: page.coordinates[0].lon
        } : undefined,
        images: await this.getPageImages(pageTitle, baseUrl),
        infobox: await this.extractInfobox(pageId, baseUrl),
        totalLength: (page.extract || '').length + sections.reduce((sum, sec) => sum + sec.content.length, 0)
      };

      console.log(`Total content length: ${result.totalLength} characters`);
      console.log(`Sections found: ${result.sections.length}`);
      console.log(`Categories: ${result.categories.length}`);
      console.log(`Images: ${result.images.length}`);

      return result;
    } catch (error) {
      console.error('Enhanced Wikipedia API error:', error);
      return null;
    }
  }

  /**
   * 特定のセクションの内容を取得
   */
  private static async getSectionContent(pageId: number, sectionIndex: string, baseUrl: string): Promise<string | null> {
    try {
      const url = `${baseUrl}?action=query&format=json&pageids=${pageId}&prop=extracts&explaintext=true&exsectionformat=plain&section=${sectionIndex}&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      
      const page = data.query?.pages?.[pageId];
      if (page?.extract) {
        return this.cleanText(page.extract);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching section ${sectionIndex}:`, error);
      return null;
    }
  }

  /**
   * ページの画像を取得
   */
  private static async getPageImages(pageTitle: string, baseUrl: string): Promise<Array<{title: string, url: string, thumbUrl?: string}>> {
    try {
      const url = `${baseUrl}?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=images&imlimit=10&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      
      const pages = Object.values(data.query.pages) as any[];
      if (!pages[0]?.images) return [];

      const images = [];
      for (const image of pages[0].images.slice(0, 5)) { // 最初の5枚まで
        const imageInfo = await this.getImageUrl(image.title, baseUrl);
        if (imageInfo) {
          images.push(imageInfo);
        }
      }
      
      return images;
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  }

  /**
   * 画像のURLを取得
   */
  private static async getImageUrl(imageTitle: string, baseUrl: string): Promise<{title: string, url: string, thumbUrl?: string} | null> {
    try {
      const url = `${baseUrl}?action=query&format=json&titles=${encodeURIComponent(imageTitle)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=300&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      
      const pages = Object.values(data.query.pages) as any[];
      const imageInfo = pages[0]?.imageinfo?.[0];
      
      if (imageInfo?.url) {
        return {
          title: imageTitle,
          url: imageInfo.url,
          thumbUrl: imageInfo.thumburl
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching image URL:', error);
      return null;
    }
  }

  /**
   * Infoboxの情報を抽出（簡易版）
   */
  private static async extractInfobox(pageId: number, baseUrl: string): Promise<Record<string, string> | undefined> {
    try {
      // Wikidata経由でstructured dataを取得する方が確実
      // ここでは簡易的な実装
      return undefined;
    } catch (error) {
      console.error('Error extracting infobox:', error);
      return undefined;
    }
  }

  /**
   * 導入部分を抽出
   */
  private static extractIntroduction(extract: string): string {
    if (!extract) return '';
    
    // 最初の段落または最初の500文字を取得
    const firstParagraph = extract.split('\n\n')[0];
    if (firstParagraph.length > 500) {
      return firstParagraph.substring(0, 500) + '...';
    }
    return firstParagraph;
  }

  /**
   * HTMLタグを除去
   */
  private static stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }

  /**
   * テキストをクリーンアップ
   */
  private static cleanText(text: string): string {
    // まずHTMLタグを除去
    let cleaned = this.stripHtml(text);
    
    // その他のクリーンアップ
    cleaned = cleaned
      .replace(/\[\d+\]/g, '') // 脚注を除去
      .replace(/\n{3,}/g, '\n\n') // 過剰な改行を削減
      .replace(/\s\s+/g, ' ') // 過剰なスペースを削減（単一スペースは保持）
      .trim();
      
    return cleaned;
  }
}
