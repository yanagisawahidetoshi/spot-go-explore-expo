import { WikipediaService } from '../../services/wikipedia';

// fetchのモックをリセット
beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
});

describe('WikipediaService', () => {
  describe('searchSpotInfo', () => {
    it('should fetch Wikipedia info for a spot in Japanese', async () => {
      const mockSearchResponse = [
        '東京タワー',
        ['東京タワー'],
        [''],
        ['https://ja.wikipedia.org/wiki/東京タワー']
      ];

      const mockExtractResponse = {
        query: {
          pages: {
            '12345': {
              pageid: 12345,
              title: '東京タワー',
              extract: '東京タワーは、東京都港区芝公園にある総合電波塔である。'
            }
          }
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockSearchResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockExtractResponse)
        });

      const result = await WikipediaService.searchSpotInfo('東京タワー', 'ja');
      
      expect(result).toBe('東京タワーは、東京都港区芝公園にある総合電波塔である。');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should fetch Wikipedia info for a spot in English', async () => {
      const mockSearchResponse = [
        'Tokyo Tower',
        ['Tokyo Tower'],
        [''],
        ['https://en.wikipedia.org/wiki/Tokyo_Tower']
      ];

      const mockExtractResponse = {
        query: {
          pages: {
            '12345': {
              pageid: 12345,
              title: 'Tokyo Tower',
              extract: 'Tokyo Tower is a communications and observation tower in the Shiba-koen district of Minato, Tokyo, Japan.'
            }
          }
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockSearchResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockExtractResponse)
        });

      const result = await WikipediaService.searchSpotInfo('Tokyo Tower', 'en');
      
      expect(result).toContain('Tokyo Tower is a communications');
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('en.wikipedia.org'));
    });

    it('should return null when no search results found', async () => {
      const mockSearchResponse = ['', [], [], []];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockSearchResponse)
      });

      const result = await WikipediaService.searchSpotInfo('NonexistentPlace', 'ja');
      
      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return null when page not found', async () => {
      const mockSearchResponse = [
        'Test Place',
        ['Test Place'],
        [''],
        ['https://ja.wikipedia.org/wiki/Test_Place']
      ];

      const mockExtractResponse = {
        query: {
          pages: {
            '-1': {
              pageid: -1,
              missing: ''
            }
          }
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockSearchResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockExtractResponse)
        });

      const result = await WikipediaService.searchSpotInfo('Test Place', 'ja');
      
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await WikipediaService.searchSpotInfo('Tokyo Tower', 'ja');
      
      expect(result).toBeNull();
    });

    it('should truncate long extracts to 3 paragraphs', async () => {
      const longExtract = `第一段落です。
      
第二段落です。

第三段落です。

第四段落です。

第五段落です。`;

      const mockSearchResponse = [
        'Test',
        ['Test'],
        [''],
        ['https://ja.wikipedia.org/wiki/Test']
      ];

      const mockExtractResponse = {
        query: {
          pages: {
            '12345': {
              pageid: 12345,
              title: 'Test',
              extract: longExtract
            }
          }
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockSearchResponse)
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockExtractResponse)
        });

      const result = await WikipediaService.searchSpotInfo('Test', 'ja');
      
      expect(result).not.toContain('第四段落');
      expect(result).not.toContain('第五段落');
      expect(result).toContain('第一段落');
      expect(result).toContain('第二段落');
      expect(result).toContain('第三段落');
    });
  });

  describe('formatHistoricalInfo', () => {
    it('should return empty string when wikiText is null', () => {
      const result = WikipediaService.formatHistoricalInfo(null, 'Tokyo Tower', 'ja');
      expect(result).toBe('');
    });

    it('should format Japanese years with 西暦', () => {
      const text = '東京タワーは1958年に建設されました。';
      const result = WikipediaService.formatHistoricalInfo(text, 'Tokyo Tower', 'ja');
      expect(result).toBe('東京タワーは西暦1958年に建設されました。');
    });

    it('should not format years in English text', () => {
      const text = 'Tokyo Tower was built in 1958.';
      const result = WikipediaService.formatHistoricalInfo(text, 'Tokyo Tower', 'en');
      expect(result).toBe('Tokyo Tower was built in 1958.');
    });
  });
});
