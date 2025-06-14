/**
 * スタンドアロンで実行できるWiki統合POCスクリプト
 * 使い方: node wiki-poc-standalone/testWikiIntegration.js
 */

// POC用のAPIサービスをインラインで定義
class WikimediaCommonsService {
  static BASE_URL = 'https://commons.wikimedia.org/w/api.php';

  static async getImagesFromWikipediaPage(pageTitle, language = 'ja') {
    try {
      const wikiBaseUrl = language === 'ja' 
        ? 'https://ja.wikipedia.org/w/api.php'
        : 'https://en.wikipedia.org/w/api.php';

      // 1. ページで使用されている画像ファイル名を取得
      const imagesUrl = `${wikiBaseUrl}?action=query&format=json&prop=images&titles=${encodeURIComponent(pageTitle)}&imlimit=10&origin=*`;
      console.log('Fetching images from:', imagesUrl);
      
      const imagesResponse = await fetch(imagesUrl);
      const imagesData = await imagesResponse.json();

      const pages = imagesData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1' || !pages[pageId].images) {
        console.log('No images found for page');
        return [];
      }

      const imageFiles = pages[pageId].images || [];
      console.log(`Found ${imageFiles.length} image files`);
      
      // 2. 各画像の詳細情報を取得
      const imagePromises = imageFiles
        .filter((img) => {
          const title = img.title.toLowerCase();
          return !title.includes('commons-logo') && 
                 !title.includes('.svg') &&
                 !title.includes('edit-icon') &&
                 !title.includes('wikimedia');
        })
        .slice(0, 3) // 最大3枚まで
        .map((img) => this.getImageDetails(img.title));

      const images = await Promise.all(imagePromises);
      return images.filter(img => img !== null);
    } catch (error) {
      console.error('Error fetching images from Wikipedia:', error);
      return [];
    }
  }

  static async getImageDetails(fileName) {
    try {
      const url = `${this.BASE_URL}?action=query&format=json&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&titles=${encodeURIComponent(fileName)}&origin=*`;
      
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
        mime: imageInfo.mime
      };
    } catch (error) {
      console.error('Error fetching image details:', error);
      return null;
    }
  }
}

class WikidataService {
  static BASE_URL = 'https://www.wikidata.org/w/api.php';
  
  static async getWikidataId(wikipediaTitle, language = 'ja') {
    try {
      const url = `${this.BASE_URL}?action=wbgetentities&format=json&sites=${language}wiki&titles=${encodeURIComponent(wikipediaTitle)}&props=info&origin=*`;
      console.log('Getting Wikidata ID from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      const entities = Object.values(data.entities);
      if (entities.length > 0 && entities[0].id) {
        return entities[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error getting Wikidata ID:', error);
      return null;
    }
  }
  
  static async getStructuredData(wikidataId, language = 'ja') {
    try {
      const url = `${this.BASE_URL}?action=wbgetentities&format=json&ids=${wikidataId}&props=labels|descriptions|claims&languages=ja|en&origin=*`;
      console.log('Getting structured data for:', wikidataId);
      
      const response = await fetch(url);
      const data = await response.json();
      const entity = data.entities[wikidataId];
      
      if (!entity) return null;

      const result = {
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

      // P149: 建築様式
      if (claims.P149?.[0]?.mainsnak?.datavalue?.value?.id) {
        result.architecturalStyle = '建築様式ID: ' + claims.P149[0].mainsnak.datavalue.value.id;
      }

      // P1435: 文化財保護指定
      if (claims.P1435?.[0]?.mainsnak?.datavalue?.value?.id) {
        result.heritage = '文化財ID: ' + claims.P1435[0].mainsnak.datavalue.value.id;
      }

      return result;
    } catch (error) {
      console.error('Error extracting structured data:', error);
      return null;
    }
  }

  static parseWikidataTime(time) {
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
}

class WikipediaService {
  static BASE_URL = 'https://ja.wikipedia.org/w/api.php';
  static EN_BASE_URL = 'https://en.wikipedia.org/w/api.php';

  static async searchSpotInfo(spotName, language = 'ja') {
    try {
      const baseUrl = language === 'ja' ? this.BASE_URL : this.EN_BASE_URL;
      
      // 1. まず検索して正確なページを見つける
      const searchUrl = `${baseUrl}?action=opensearch&format=json&search=${encodeURIComponent(spotName)}&limit=1&origin=*`;
      console.log('Searching Wikipedia:', searchUrl);
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData[1] || searchData[1].length === 0) {
        console.log('No Wikipedia page found');
        return null;
      }

      const pageTitle = searchData[1][0];
      console.log('Found page:', pageTitle);
      
      // 2. ページの詳細情報を取得
      const extractUrl = `${baseUrl}?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(pageTitle)}&origin=*`;
      const extractResponse = await fetch(extractUrl);
      const extractData = await extractResponse.json();
      
      const pages = extractData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1' || !pages[pageId].extract) {
        return null;
      }

      let extract = pages[pageId].extract;
      
      // 長すぎる場合は要約
      if (extract.length > 500) {
        const paragraphs = extract.split('\n').filter(p => p.trim());
        extract = paragraphs.slice(0, 3).join('\n\n');
      }

      return extract;
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      return null;
    }
  }
}

// テスト実行
async function testWikiIntegration(spotName) {
  console.log(`\n========================================`);
  console.log(`Testing Wiki Integration for: ${spotName}`);
  console.log(`========================================\n`);

  // 1. Wikipedia情報を取得
  console.log('1. Fetching Wikipedia information...');
  const wikiInfo = await WikipediaService.searchSpotInfo(spotName);
  if (wikiInfo) {
    console.log('✅ Wikipedia extract:');
    console.log(wikiInfo.substring(0, 200) + '...\n');
  } else {
    console.log('❌ No Wikipedia information found\n');
  }

  // 2. Wikidata情報を取得
  console.log('2. Fetching Wikidata information...');
  const wikidataId = await WikidataService.getWikidataId(spotName);
  if (wikidataId) {
    console.log(`✅ Wikidata ID: ${wikidataId}`);
    
    const structuredData = await WikidataService.getStructuredData(wikidataId);
    if (structuredData) {
      console.log('✅ Structured data:');
      console.log(JSON.stringify(structuredData, null, 2) + '\n');
    }
  } else {
    console.log('❌ No Wikidata ID found\n');
  }

  // 3. Wikimedia Commons画像を取得
  console.log('3. Fetching Wikimedia Commons images...');
  const images = await WikimediaCommonsService.getImagesFromWikipediaPage(spotName);
  if (images.length > 0) {
    console.log(`✅ Found ${images.length} images:`);
    images.forEach((img, index) => {
      console.log(`   ${index + 1}. ${img.title}`);
      console.log(`      URL: ${img.thumbUrl || img.url}`);
    });
  } else {
    console.log('❌ No images found');
  }

  console.log('\n');
}

// メイン実行
async function main() {
  console.log('Starting Wiki Integration POC Test...\n');
  
  // テストする観光スポット
  const testSpots = ['清水寺', '金閣寺', '東京タワー', '富士山'];
  
  for (const spot of testSpots) {
    await testWikiIntegration(spot);
    // API制限を避けるため少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Test completed!');
}

// Node.jsで実行
if (typeof window === 'undefined') {
  main().catch(console.error);
} else {
  console.log('This script should be run in Node.js environment');
}
