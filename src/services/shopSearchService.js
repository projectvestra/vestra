// src/services/shopSearchService.js

const SERP_API_KEY = 'YOUR_SERPAPI_KEY';
const SERP_API_URL = 'https://serpapi.com/search';

// Build precise search query from item — uses color + category + fit/size
function buildSearchQuery(item) {
  const type = (item.category || item.name || 'clothing').toLowerCase()
    .replace('shirts', 'shirt')
    .replace('pants', 'trouser')
    .replace('shoes', 'shoes')
    .replace('accessories', 'accessory');

  const color = (item.colorName || item.detectedColor || '').toLowerCase();
  const fit = item.fit ? item.fit.toLowerCase() : '';
  const size = item.size ? item.size : '';

  // Build a precise query: "slim white shirt men" or "white sneakers US 9"
  const parts = [color, fit, type].filter(Boolean);
  return parts.join(' ').trim();
}

// Generate direct shopping search URLs
export function getShoppingLinks(item) {
  const query = buildSearchQuery(item);
  const encoded = encodeURIComponent(query);

  return {
    myntra:   `https://www.myntra.com/${encodeURIComponent((item.category || 'clothing').toLowerCase())}?rawQuery=${encoded}`,
    meesho:   `https://www.meesho.com/search?q=${encoded}`,
    flipkart: `https://www.flipkart.com/search?q=${encoded}`,
    amazon:   `https://www.amazon.in/s?k=${encoded}`,
  };
}

// Search using SerpAPI for real product results
export async function searchProductsOnline(item, platform = 'all') {
  if (!SERP_API_KEY || SERP_API_KEY === 'YOUR_SERPAPI_KEY') {
    return generateDirectLinks(item, platform);
  }

  try {
    const query = buildSearchQuery(item);
    const url = `${SERP_API_URL}?engine=google_shopping&q=${encodeURIComponent(query + ' india')}&gl=in&hl=en&api_key=${SERP_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.shopping_results) return generateDirectLinks(item, platform);

    return data.shopping_results.slice(0, 8).map((result, i) => ({
      id: i.toString(),
      title: result.title,
      price: result.price,
      image: result.thumbnail,
      link: result.link,
      source: result.source,
      platform: detectPlatform(result.link),
    }));

  } catch (error) {
    return generateDirectLinks(item, platform);
  }
}

function detectPlatform(url = '') {
  if (url.includes('myntra')) return 'Myntra';
  if (url.includes('meesho')) return 'Meesho';
  if (url.includes('flipkart')) return 'Flipkart';
  if (url.includes('amazon')) return 'Amazon';
  return 'Online';
}

function generateDirectLinks(item, platform) {
  const links = getShoppingLinks(item);
  const query = buildSearchQuery(item);

  const platforms = platform === 'all'
    ? ['myntra', 'meesho', 'flipkart', 'amazon']
    : [platform];

  return platforms.map(p => ({
    id: p,
    title: `Search "${query}" on ${p.charAt(0).toUpperCase() + p.slice(1)}`,
    price: null,
    image: null,
    link: links[p],
    source: p,
    platform: p.charAt(0).toUpperCase() + p.slice(1),
    isDirectLink: true,
  }));
}

// Shop a complete outfit — searches for each piece
export async function shopCompleteOutfit(outfit) {
  const results = {};
  const top = outfit.top || outfit.shirt;
  const bottom = outfit.bottom || outfit.pants;
  const shoes = outfit.shoes;

  if (top) results.top = await searchProductsOnline(top);
  if (bottom) results.bottom = await searchProductsOnline(bottom);
  if (shoes) results.shoes = await searchProductsOnline(shoes);

  return results;
}

// Best single item finder — builds a precise query for finding
// the best version of one item across all platforms
export async function findBestItem(category, preferences = {}) {
  const searchItem = {
    category,
    colorName: preferences.color || '',
    fit: preferences.fit || '',
    size: preferences.size || '',
  };

  const query = buildSearchQuery(searchItem);
  const links = getShoppingLinks(searchItem);

  // With SerpAPI — return real results
  if (SERP_API_KEY && SERP_API_KEY !== 'YOUR_SERPAPI_KEY') {
    return searchProductsOnline(searchItem);
  }

  // Without SerpAPI — return direct search links for all platforms
  return [
    {
      id: 'myntra',
      title: `Best ${query} on Myntra`,
      subtitle: 'Tap to browse curated results',
      link: links.myntra,
      platform: 'Myntra',
      color: '#FF3F6C',
    },
    {
      id: 'meesho',
      title: `Best ${query} on Meesho`,
      subtitle: 'Affordable options',
      link: links.meesho,
      platform: 'Meesho',
      color: '#9B1FE8',
    },
    {
      id: 'flipkart',
      title: `Best ${query} on Flipkart`,
      subtitle: 'Fast delivery options',
      link: links.flipkart,
      platform: 'Flipkart',
      color: '#2874F0',
    },
    {
      id: 'amazon',
      title: `Best ${query} on Amazon`,
      subtitle: 'Prime eligible options',
      link: links.amazon,
      platform: 'Amazon',
      color: '#FF9900',
    },
  ];
}