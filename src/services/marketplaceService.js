import Constants from 'expo-constants';

const expoExtra = Constants.expoConfig?.extra || {};
const MARKETPLACE_API_URL =
  expoExtra.marketplace?.apiUrl || process.env.EXPO_PUBLIC_MARKETPLACE_API_URL;

const DEFAULT_PRODUCTS = [];

function toAmazonSearchUrl(name) {
  if (!name) return '';
  const query = encodeURIComponent(name);
  return `https://www.amazon.in/s?k=${query}`;
}

function normalizeCategory(rawCategory) {
  const category = (rawCategory || '').toLowerCase();
  if (category.includes('shirt') || category.includes('top')) return 'Shirts';
  if (category.includes('pant') || category.includes('jean') || category.includes('trouser')) return 'Pants';
  if (category.includes('shoe') || category.includes('sneaker') || category.includes('footwear')) return 'Shoes';
  return 'Accessories';
}

function normalizeProduct(item, index) {
  const category = normalizeCategory(item.category);
  const fallbackLink = toAmazonSearchUrl(item.name || item.title || 'fashion');
  const link = item.affiliateUrl || item.url || item.link || item.productUrl || fallbackLink;

  return {
    id: String(item.id || item.productId || `remote-${index}`),
    name: item.name || item.title || 'Untitled product',
    brand: item.brand || item.vendor || 'Brand',
    category,
    price: Number(item.price || item.amount || 0),
    currency: item.currency || '₹',
    imageUrl: item.imageUrl || item.image || item.thumbnail || '',
    description: item.description || 'Fashion product',
    affiliateUrl: link,
    source: item.source || item.marketplace || 'partner',
  };
}

async function fetchDummyProductsFallback() {
  try {
    const response = await fetch('https://dummyjson.com/products?limit=30');
    if (!response.ok) {
      return DEFAULT_PRODUCTS;
    }

    const payload = await response.json();
    const rawProducts = payload?.products || [];

    return rawProducts.map((item, index) =>
      normalizeProduct(
        {
          ...item,
          imageUrl: item.thumbnail || item.images?.[0] || '',
          source: 'dummyjson',
        },
        index
      )
    );
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export async function fetchMarketplaceProducts() {
  if (!MARKETPLACE_API_URL) {
    return fetchDummyProductsFallback();
  }

  try {
    const response = await fetch(MARKETPLACE_API_URL);
    if (!response.ok) {
      return DEFAULT_PRODUCTS;
    }

    const payload = await response.json();
    const rawProducts = Array.isArray(payload) ? payload : payload.products || [];

    const normalized = rawProducts
      .map((item, index) => normalizeProduct(item, index))
      .filter((item) => item.affiliateUrl);

    if (normalized.length === 0) {
      return fetchDummyProductsFallback();
    }

    return normalized;
  } catch {
    return fetchDummyProductsFallback();
  }
}

export function filterByCategory(productList, category) {
  if (!category) return productList;
  return productList.filter((item) => item.category === category);
}

export function sortByPrice(productList, order = 'asc') {
  const sorted = [...productList].sort((a, b) => a.price - b.price);
  return order === 'asc' ? sorted : sorted.reverse();
}