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
  sections?: any[];
}

export class WikipediaService {
  private static readonly BASE_URL = 'https://ja.wikipedia.org/w/api.php';
  private static readonly EN_BASE_URL = 'https://en.wikipedia.org/w/api.php';

  static async searchSpotInfo(
    spotName: string,
    language: 'ja' | 'en' = 'ja'
  ): Promise<string | null> {
    try {
      const baseUrl = language === 'ja' ? this.BASE_URL : this.EN_BASE_URL;

      // 1. まず検索して正確なページを見つける
      const searchUrl = `${baseUrl}?action=opensearch&format=json&search=${encodeURIComponent(spotName)}&limit=1&origin=*`;
      console.log('Searching Wikipedia:', searchUrl);
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData[1] || searchData[1].length === 0) {
        return null;
      }

      const pageTitle = searchData[1][0];
      console.log('Found page:', pageTitle);

      // 2. Extract APIを使用（より詳細な情報を取得）
      const extractUrl = `${baseUrl}?action=query&format=json&prop=extracts&explaintext=true&exsectionformat=plain&exlimit=max&titles=${encodeURIComponent(pageTitle)}&origin=*`;
      console.log('Fetching extract:', extractUrl);
      const extractResponse = await fetch(extractUrl);
      const extractData = await extractResponse.json();

      if (extractData.query?.pages) {
        const pages = Object.values(extractData.query.pages) as any[];
        const page = pages[0];

        if (page?.extract) {
          console.log('Extract found, length:', page.extract.length);
          // 生データの一部をログ出力
          console.log('Raw extract sample:', page.extract.substring(0, 200));
          // セクションを整形して返す
          const formattedExtract = this.formatWikipediaExtract(page.extract, spotName);
          // 長さを確認
          console.log(`Wikipedia content length: ${formattedExtract.length} characters`);
          console.log('Formatted sample:', formattedExtract.substring(0, 200));
          return formattedExtract;
        }
      }

      // 3. フォールバック: Parse APIを試す
      const parseUrl = `${baseUrl}?action=parse&format=json&page=${encodeURIComponent(pageTitle)}&prop=text&section=0&origin=*`;
      console.log('Trying parse API:', parseUrl);
      const parseResponse = await fetch(parseUrl);
      const parseData = await parseResponse.json();

      if (parseData.parse?.text?.['*']) {
        console.log('Parse data found');
        const htmlContent = parseData.parse.text['*'];
        const textContent = this.stripHtml(htmlContent);
        return this.formatWikipediaExtract(textContent, spotName);
      }

      console.log('No content found');
      return null;
    } catch (error) {
      console.error('Wikipedia API error:', error);
      // フォールバック: Extract APIを使用
      return this.fallbackExtractAPI(spotName, language);
    }
  }

  // HTMLタグを除去してテキストを抽出
  private static stripHtml(html: string): string {
    // 基本的なHTMLタグの除去
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\[\d+\]/g, '') // 脚注番号を除去
      .replace(/\s+/g, ' ')
      .trim();

    // HTMLエンティティをデコード
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    return text;
  }

  // Wikipedia Extractを整形
  private static formatWikipediaExtract(extract: string, spotName: string): string {
    if (!extract) return '';

    // セクションを認識して整形
    const lines = extract.split('\n');
    const formatted: string[] = [];
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // セクションヘッダーを認識（== で囲まれている場合）
      if (trimmed.match(/^=+.*=+$/)) {
        const headerText = trimmed.replace(/^=+\s*|\s*=+$/g, '');
        currentSection = headerText;
        formatted.push(`\n【${headerText}】\n`);
      } else {
        // HTMLタグを除去してから追加
        const cleanedText = this.stripHtml(trimmed);
        if (cleanedText) {
          formatted.push(cleanedText);
        }
      }
    }

    // 最初の部分に概要がない場合は追加
    if (!formatted[0]?.includes('【')) {
      const introIndex = formatted.findIndex(line => line.includes('【'));
      if (introIndex > 0) {
        const intro = formatted.slice(0, introIndex).join(' ');
        formatted.splice(0, introIndex, `【概要】\n${intro}`);
      }
    }

    return formatted.join('\n');
  }

  // 重要なセクションを抽出
  private static extractImportantSections(fullText: string, sections: any[]): string {
    const result: string[] = [];

    // イントロダクション部分を抽出
    const introMatch = fullText.match(/^[^。]+。[^。]+。[^。]+。/);
    if (introMatch) {
      result.push(introMatch[0]);
    }

    // 重要なセクションのキーワード
    const importantKeywords = [
      '歴史',
      '概要',
      '特徴',
      '由来',
      '建築',
      '文化',
      '観光',
      '構造',
      '設計',
    ];

    // セクションごとにテキストを分割して重要な部分を抽出
    for (const section of sections) {
      const sectionTitle = section.line;
      const isImportant = importantKeywords.some(keyword => sectionTitle.includes(keyword));

      if (isImportant) {
        // セクションのテキストを探す（簡易版）
        const sectionPattern = new RegExp(`${sectionTitle}[^。]*。[^。]*。[^。]*。`, 'g');
        const sectionMatch = fullText.match(sectionPattern);
        if (sectionMatch) {
          result.push(`\n\n【${sectionTitle}】\n${sectionMatch[0]}`);
        }
      }
    }

    return result.join('\n');
  }

  // フォールバック: Extract APIを使用
  private static async fallbackExtractAPI(
    spotName: string,
    language: 'ja' | 'en'
  ): Promise<string | null> {
    try {
      const baseUrl = language === 'ja' ? this.BASE_URL : this.EN_BASE_URL;
      const extractUrl = `${baseUrl}?action=query&format=json&prop=extracts&exintro=false&explaintext=true&exsectionformat=plain&titles=${encodeURIComponent(spotName)}&origin=*`;

      const response = await fetch(extractUrl);
      const data = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === '-1' || !pages[pageId].extract) {
        return null;
      }

      return pages[pageId].extract;
    } catch (error) {
      console.error('Fallback API error:', error);
      return null;
    }
  }

  // 観光スポット用の詳細な歴史情報を生成
  static formatHistoricalInfo(
    wikiText: string | null,
    spotName: string,
    language: 'ja' | 'en'
  ): string {
    if (!wikiText) {
      return '';
    }

    // 歴史的な年代や重要な情報を強調
    let formattedText = wikiText;

    // 年代情報を強調（例：1234年 → 西暦1234年）
    if (language === 'ja') {
      formattedText = formattedText.replace(/(\d{3,4})年/g, '西暦$1年');
    }

    // セクションヘッダーを見やすく
    formattedText = formattedText.replace(
      /^(.*歴史.*|.*概要.*|.*特徴.*|.*由来.*|.*建築.*|.*文化.*)$/gm,
      '【$1】'
    );

    return formattedText;
  }
}
