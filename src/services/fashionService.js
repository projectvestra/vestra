// import { mockExploreData } from '../data/mockExploreData';

// const BASE_URL = 'https://newsapi.org/v2/everything';

// export async function fetchFashionTrends() {
//   try {
//     const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;

//     if (!apiKey) {
//       throw new Error('News API key missing');
//     }

//     const response = await fetch(
//       `${BASE_URL}?q=fashion&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`
//     );

//     const data = await response.json();

//     if (!response.ok || !data.articles) {
//       throw new Error('Invalid API response');
//     }

//     const normalized = normalizeFashionData(data.articles);

//     return normalized.length > 0 ? normalized : mockExploreData;
//   } catch (error) {
//     console.warn('Fashion API error:', error.message);
//     return mockExploreData;
//   }
// }
// export function normalizeFashionData(articles = []) {
//   return articles
//     .filter((item) => item.title && item.url)
//     .map((item, index) => ({
//       id: item.url || `fashion-${index}`,
//       title: item.title,
//       description: item.description || '',
//       image: item.urlToImage || null,
//       source: item.source?.name || 'Unknown',
//       publishedAt: item.publishedAt || '',
//       url: item.url,
//     }));
// }


// const data = await fetchFashionTrends();
// console.log(data);



// export async function fetchFashionTrends() {
//   return [
//     {
//       id: '1',
//       title: 'Test Article',
//       description: 'This is a test.',
//       image: null,
//       source: 'Test Source',
//       publishedAt: '',
//       url: 'https://example.com',
//     },
//   ];
// }





import Constants from 'expo-constants';
import { mockExploreData } from '../data/mockExploreData';

const BASE_URL = 'https://newsapi.org/v2/everything';

export async function fetchFashionTrends() {
  try {
    const apiKey = Constants.expoConfig?.extra?.newsApiKey;

    if (!apiKey) {
      console.warn('News API key missing');
      return mockExploreData;
    }

    const response = await fetch(
      `${BASE_URL}?q=fashion&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`
    );

    const data = await response.json();

    if (!response.ok || !data.articles) {
      return mockExploreData;
    }

    const normalized = normalizeFashionData(data.articles);

    return normalized.length > 0 ? normalized : mockExploreData;
  } catch (error) {
    console.warn('Fashion API error:', error);
    return mockExploreData;
  }
//   console.log("API KEY:", apiKey);
// console.log("API RESPONSE:", data);
}

function normalizeFashionData(articles = []) {
  return articles
    .filter((item) => item.title && item.url)
    .map((item, index) => ({
      id: item.url || `fashion-${index}`,
      title: item.title,
      description: item.description || '',
      image: item.urlToImage || null,
      source: item.source?.name || 'Unknown',
      publishedAt: item.publishedAt || '',
      url: item.url,
    }));
}