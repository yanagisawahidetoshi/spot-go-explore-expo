import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { WikipediaService } from '@/features/spots/api/wikipedia';

export const WikipediaAPITest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testWikipediaAPI = async (spotName: string) => {
    setLoading(true);
    setResult('Loading...');
    
    try {
      // 1. 基本的なAPIコール
      const baseUrl = 'https://ja.wikipedia.org/w/api.php';
      
      // OpenSearch API
      const searchUrl = `${baseUrl}?action=opensearch&format=json&search=${encodeURIComponent(spotName)}&limit=1&origin=*`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      let resultText = `=== OpenSearch API ===\n`;
      resultText += `URL: ${searchUrl}\n`;
      resultText += `Result: ${JSON.stringify(searchData, null, 2)}\n\n`;
      
      if (searchData[1] && searchData[1].length > 0) {
        const pageTitle = searchData[1][0];
        
        // Extract API (current)
        const extractUrl = `${baseUrl}?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(pageTitle)}&origin=*`;
        const extractResponse = await fetch(extractUrl);
        const extractData = await extractResponse.json();
        
        resultText += `=== Extract API (intro only) ===\n`;
        resultText += `URL: ${extractUrl}\n`;
        const pages = extractData.query.pages;
        const pageId = Object.keys(pages)[0];
        resultText += `Extract length: ${pages[pageId].extract?.length || 0}\n`;
        resultText += `Extract: ${pages[pageId].extract?.substring(0, 300)}...\n\n`;
        
        // Parse API
        const parseUrl = `${baseUrl}?action=parse&format=json&page=${encodeURIComponent(pageTitle)}&prop=text&section=0&origin=*`;
        const parseResponse = await fetch(parseUrl);
        const parseData = await parseResponse.json();
        
        resultText += `=== Parse API ===\n`;
        resultText += `URL: ${parseUrl}\n`;
        resultText += `Has text: ${!!parseData.parse?.text}\n`;
        if (parseData.parse?.text) {
          const textLength = parseData.parse.text['*'].length;
          resultText += `HTML length: ${textLength}\n`;
        }
      }
      
      // WikipediaService test
      resultText += `\n=== WikipediaService.searchSpotInfo ===\n`;
      const serviceResult = await WikipediaService.searchSpotInfo(spotName, 'ja');
      resultText += `Result length: ${serviceResult?.length || 0}\n`;
      resultText += `Result: ${serviceResult?.substring(0, 300)}...\n`;
      
      setResult(resultText);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wikipedia API Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Test: 東京タワー" onPress={() => testWikipediaAPI('東京タワー')} disabled={loading} />
        <Button title="Test: 清水寺" onPress={() => testWikipediaAPI('清水寺')} disabled={loading} />
        <Button title="Test: 富士山" onPress={() => testWikipediaAPI('富士山')} disabled={loading} />
      </View>
      
      <Text style={styles.result}>{result}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  result: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});