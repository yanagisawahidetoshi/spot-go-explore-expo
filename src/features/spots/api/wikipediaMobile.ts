/**
 * Mobile Wikipedia Service
 * モバイル版Wikipedia APIを使用してより読みやすい形式で情報を取得
 */

export interface MobileWikipediaContent {
  title: string;
  description: string;
  extract: string;
  sections: Array<{
    id: number;
    title: string;
    content: string;
  }>;
  lead_image_url?: string;
}

export class MobileWikipediaService {
  private static readonly BASE_URL = 'https://ja.wikipedia.org/api/rest_v1';
  private static readonly EN_BASE_URL = 'https://en.wikipedia.org/api/rest_v1';

  /**
   * モバイル版APIで記事の要約を取得
   */
  static async getMobileSummary(spotName: string, language: 'ja' | 'en' = 'ja'): Promise<MobileWikipediaContent | null> {
    try {
      const baseUrl = language === 'ja' ? this.BASE_URL : this.EN_BASE_URL;
      
      // モバイル版の要約エンドポイント
      const summaryUrl = `${baseUrl}/page/summary/${encodeURIComponent(spotName)}`;
      console.log('Fetching mobile summary:', summaryUrl);
      
      const response = await fetch(summaryUrl);
      if (!response.ok) {
        console.log('Mobile API response not OK:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (!data.title) {
        return null;
      }

      // モバイル版の詳細コンテンツを取得
      const mobileUrl = `${baseUrl}/page/mobile-sections/${encodeURIComponent(data.title)}`;
      console.log('Fetching mobile sections:', mobileUrl);
      
      const mobileResponse = await fetch(mobileUrl);
      if (!mobileResponse.ok) {
        // 要約だけでも返す
        return {
          title: data.title,
          description: data.description || '',
          extract: data.extract || '',
          sections: [],
          lead_image_url: data.thumbnail?.source
        };
      }

      const mobileData = await mobileResponse.json();
      
      // セクションを処理
      const sections = this.processMobileSections(mobileData.sections || []);
      
      return {
        title: data.title,
        description: data.description || '',
        extract: data.extract || mobileData.lead?.sections?.[0]?.text || '',
        sections: sections,
        lead_image_url: data.thumbnail?.source || mobileData.lead?.image?.urls?.['640']
      };
      
    } catch (error) {
      console.error('Mobile Wikipedia API error:', error);
      return null;
    }
  }

  /**
   * モバイル版のセクションを処理
   */
  private static processMobileSections(sections: any[]): Array<{ id: number; title: string; content: string }> {
    const processed: Array<{ id: number; title: string; content: string }> = [];
    
    // 重要なセクションのキーワード
    const importantKeywords = ['歴史', '概要', '特徴', '由来', '建築', '文化', '観光', '構造', '設計', '背景', '意義'];
    
    for (const section of sections.slice(0, 20)) { // 最初の20セクションまで
      if (section.line && section.text) {
        // 重要なセクションを優先
        const isImportant = importantKeywords.some(keyword => section.line.includes(keyword));
        
        if (isImportant || processed.length < 5) {
          processed.push({
            id: section.id || processed.length,
            title: section.line,
            content: this.cleanMobileText(section.text)
          });
        }
      }
    }
    
    return processed;
  }

  /**
   * モバイル版のテキストをクリーンアップ
   */
  private static cleanMobileText(text: string): string {
    return text
      .replace(/\[\d+\]/g, '') // 脚注を除去
      .replace(/<[^>]+>/g, '') // HTMLタグを除去
      .replace(/\{\{[^}]+\}\}/g, '') // テンプレートを除去
      .replace(/\n{3,}/g, '\n\n') // 過剰な改行を削減
      .trim();
  }

  /**
   * 読みやすい形式にフォーマット
   */
  static formatMobileContent(content: MobileWikipediaContent): string {
    const parts: string[] = [];
    
    // タイトルと説明
    parts.push(`【${content.title}】`);
    if (content.description) {
      parts.push(content.description);
      parts.push('');
    }
    
    // 抜粋
    if (content.extract) {
      parts.push('【概要】');
      parts.push(content.extract);
      parts.push('');
    }
    
    // 各セクション
    for (const section of content.sections) {
      parts.push(`【${section.title}】`);
      parts.push(section.content);
      parts.push('');
    }
    
    return parts.join('\n');
  }
}
