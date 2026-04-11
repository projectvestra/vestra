import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const expoExtra = Constants.expoConfig?.extra || {};
const MARKETPLACE_API_URL =
  expoExtra.marketplace?.apiUrl || process.env.EXPO_PUBLIC_MARKETPLACE_API_URL;

const DEFAULT_PRODUCTS = [];
const SAVED_MARKETPLACE_ITEMS_KEY = '@vestra_marketplace_wishlist_items';
const LEGACY_SAVED_MARKETPLACE_ITEMS_KEY = '@vestra_saved_marketplace_items';
const MARKETPLACE_ROTATION_KEY = '@vestra_marketplace_rotation_offset';
const ROTATION_STEP = 8;

const CURATED_PRODUCTS = [
  { id: 'myntra-1', name: 'Slim Fit Linen Shirt', brand: 'Roadster', category: 'Shirts', price: 1299, currency: '₹', imageUrl: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Breathable summer linen shirt', affiliateUrl: 'https://www.myntra.com/men-shirts', deepLinkUrl: 'myntra://product/men-shirts', source: 'myntra' },
  { id: 'myntra-2', name: 'Relaxed Denim Jeans', brand: 'Levis', category: 'Pants', price: 2399, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Relaxed fit washed denim', affiliateUrl: 'https://www.myntra.com/men-jeans', deepLinkUrl: 'myntra://product/men-jeans', source: 'myntra' },
  { id: 'myntra-3', name: 'Chunky Street Sneakers', brand: 'Puma', category: 'Shoes', price: 3499, currency: '₹', imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Comfort sneakers for daily wear', affiliateUrl: 'https://www.myntra.com/men-casual-shoes', deepLinkUrl: 'myntra://product/men-casual-shoes', source: 'myntra' },
  { id: 'ajio-1', name: 'Oversized Graphic Tee', brand: 'Netplay', category: 'Shirts', price: 899, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Streetwear oversized t-shirt', affiliateUrl: 'https://www.ajio.com/men-tshirts/c/830216018', source: 'ajio' },
  { id: 'ajio-2', name: 'Pleated Wide Trousers', brand: 'DNMX', category: 'Pants', price: 1599, currency: '₹', imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Modern fit pleated trousers', affiliateUrl: 'https://www.ajio.com/men-trousers/c/830216008', source: 'ajio' },
  { id: 'ajio-3', name: 'Leather Strap Watch', brand: 'Timex', category: 'Accessories', price: 2199, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Classic leather watch for smart outfits', affiliateUrl: 'https://www.ajio.com/men-watches/c/830216014', source: 'ajio' },
  { id: 'hm-1', name: 'Textured Resort Shirt', brand: 'H&M', category: 'Shirts', price: 1499, currency: '₹', imageUrl: 'https://images.pexels.com/photos/5370707/pexels-photo-5370707.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Resort collar textured shirt', affiliateUrl: 'https://www2.hm.com/en_in/men/shop-by-product/shirts.html', source: 'hm' },
  { id: 'hm-2', name: 'Cargo Utility Pants', brand: 'H&M', category: 'Pants', price: 2299, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Utility cargo pants with roomy pockets', affiliateUrl: 'https://www2.hm.com/en_in/men/shop-by-product/trousers.html', source: 'hm' },
  { id: 'hm-3', name: 'Canvas High-Top Shoes', brand: 'H&M', category: 'Shoes', price: 1999, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Everyday high-top canvas shoes', affiliateUrl: 'https://www2.hm.com/en_in/men/shop-by-product/shoes.html', source: 'hm' },
  { id: 'zara-1', name: 'Knitted Polo Shirt', brand: 'Zara', category: 'Shirts', price: 2990, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6311587/pexels-photo-6311587.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Premium knit polo for smart casual looks', affiliateUrl: 'https://www.zara.com/in/en/man-shirts-l737.html', source: 'zara' },
  { id: 'zara-2', name: 'Tapered Formal Trousers', brand: 'Zara', category: 'Pants', price: 3590, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6667138/pexels-photo-6667138.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Office-ready tapered trousers', affiliateUrl: 'https://www.zara.com/in/en/man-trousers-l838.html', source: 'zara' },
  { id: 'zara-3', name: 'Minimal Leather Loafers', brand: 'Zara', category: 'Shoes', price: 4990, currency: '₹', imageUrl: 'https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Classic leather loafers', affiliateUrl: 'https://www.zara.com/in/en/man-shoes-l769.html', source: 'zara' },
  { id: 'nike-1', name: 'Dri-FIT Training Tee', brand: 'Nike', category: 'Shirts', price: 1795, currency: '₹', imageUrl: 'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Quick dry workout tee', affiliateUrl: 'https://www.nike.com/in/w/mens-tops-t-shirts-9om13znik1', source: 'nike' },
  { id: 'nike-2', name: 'Club Fleece Joggers', brand: 'Nike', category: 'Pants', price: 2995, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6311385/pexels-photo-6311385.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Soft fleece joggers', affiliateUrl: 'https://www.nike.com/in/w/mens-pants-tights-2kq19znik1', source: 'nike' },
  { id: 'nike-3', name: 'Air Max Runner', brand: 'Nike', category: 'Shoes', price: 7495, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Cushioned daily runner', affiliateUrl: 'https://www.nike.com/in/w/mens-shoes-nik1zy7ok', source: 'nike' },
  { id: 'adidas-1', name: 'Essential 3-Stripes Tee', brand: 'Adidas', category: 'Shirts', price: 1499, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6311659/pexels-photo-6311659.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Classic sports t-shirt', affiliateUrl: 'https://www.adidas.co.in/men-t_shirts', source: 'adidas' },
  { id: 'adidas-2', name: 'Tiro Track Pants', brand: 'Adidas', category: 'Pants', price: 2799, currency: '₹', imageUrl: 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Slim football-inspired track pants', affiliateUrl: 'https://www.adidas.co.in/men-track_pants', source: 'adidas' },
  { id: 'adidas-3', name: 'Forum Court Sneakers', brand: 'Adidas', category: 'Shoes', price: 8999, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Retro basketball low tops', affiliateUrl: 'https://www.adidas.co.in/men-shoes', source: 'adidas' },
  { id: 'uniqlo-1', name: 'Oxford Button Down Shirt', brand: 'Uniqlo', category: 'Shirts', price: 1990, currency: '₹', imageUrl: 'https://images.pexels.com/photos/5325880/pexels-photo-5325880.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Minimal oxford shirt', affiliateUrl: 'https://www.uniqlo.com/in/en/men/tops/shirts', source: 'uniqlo' },
  { id: 'uniqlo-2', name: 'Smart Ankle Trousers', brand: 'Uniqlo', category: 'Pants', price: 2490, currency: '₹', imageUrl: 'https://images.pexels.com/photos/7679444/pexels-photo-7679444.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Stretch ankle trousers', affiliateUrl: 'https://www.uniqlo.com/in/en/men/bottoms/trousers', source: 'uniqlo' },
  { id: 'uniqlo-3', name: 'UV Protection Cap', brand: 'Uniqlo', category: 'Accessories', price: 790, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Everyday sun-safe cap', affiliateUrl: 'https://www.uniqlo.com/in/en/men/accessories', source: 'uniqlo' },
  { id: 'ss-1', name: 'Mandarin Collar Shirt', brand: 'Snitch', category: 'Shirts', price: 1399, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6817411/pexels-photo-6817411.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Smart mandarin collar look', affiliateUrl: 'https://www.snitch.co.in/collections/shirts', source: 'snitch' },
  { id: 'ss-2', name: 'Korean Fit Trousers', brand: 'Snitch', category: 'Pants', price: 1699, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6311494/pexels-photo-6311494.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Tailored tapered trousers', affiliateUrl: 'https://www.snitch.co.in/collections/trousers', source: 'snitch' },
  { id: 'ss-3', name: 'Classic Aviator Sunglasses', brand: 'Ray-Ban', category: 'Accessories', price: 6290, currency: '₹', imageUrl: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'UV-protected premium aviators', affiliateUrl: 'https://www.myntra.com/sunglasses', source: 'myntra' },
  { id: 'mn-4', name: 'Cotton Polo T-shirt', brand: 'U.S. Polo Assn.', category: 'Shirts', price: 1599, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1830194/pexels-photo-1830194.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Soft cotton polo for weekends', affiliateUrl: 'https://www.myntra.com/men-tshirts', source: 'myntra' },
  { id: 'mn-5', name: 'Casual Chinos', brand: 'Allen Solly', category: 'Pants', price: 1899, currency: '₹', imageUrl: 'https://images.pexels.com/photos/5253588/pexels-photo-5253588.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Stretch chino fit for daily wear', affiliateUrl: 'https://www.myntra.com/men-trousers', source: 'myntra' },
  { id: 'mn-6', name: 'Slip-on Canvas Sneakers', brand: 'Converse', category: 'Shoes', price: 2999, currency: '₹', imageUrl: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Easy slip-on everyday sneakers', affiliateUrl: 'https://www.myntra.com/men-casual-shoes', source: 'myntra' },
  { id: 'mn-7', name: 'Layered Pendant Necklace', brand: 'H&M', category: 'Accessories', price: 799, currency: '₹', imageUrl: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Minimal layered chain accessory', affiliateUrl: 'https://www2.hm.com/en_in/men/shop-by-product/accessories.html', source: 'hm' },
  { id: 'mn-8', name: 'Minimal Leather Belt', brand: 'Tommy Hilfiger', category: 'Accessories', price: 2499, currency: '₹', imageUrl: 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Full-grain leather belt', affiliateUrl: 'https://www.myntra.com/men-belts', source: 'myntra' },
  { id: 'mn-9', name: 'Retro Running Shoes', brand: 'New Balance', category: 'Shoes', price: 6999, currency: '₹', imageUrl: 'https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Retro-inspired running silhouette', affiliateUrl: 'https://www.myntra.com/men-sports-shoes', source: 'myntra' },
  { id: 'mn-10', name: 'Flannel Check Shirt', brand: 'Wrangler', category: 'Shirts', price: 1999, currency: '₹', imageUrl: 'https://images.pexels.com/photos/3775164/pexels-photo-3775164.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Soft flannel checks', affiliateUrl: 'https://www.myntra.com/men-shirts', source: 'myntra' },
  { id: 'mn-11', name: 'Athleisure Cargo Joggers', brand: 'HRX', category: 'Pants', price: 1499, currency: '₹', imageUrl: 'https://images.pexels.com/photos/9558629/pexels-photo-9558629.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Multi-pocket athleisure joggers', affiliateUrl: 'https://www.myntra.com/men-track-pants', source: 'myntra' },
  { id: 'mn-12', name: 'Textured Knit Beanie', brand: 'H&M', category: 'Accessories', price: 699, currency: '₹', imageUrl: 'https://images.pexels.com/photos/6311618/pexels-photo-6311618.jpeg?auto=compress&cs=tinysrgb&w=1200', description: 'Warm knit beanie for winter fits', affiliateUrl: 'https://www2.hm.com/en_in/men/shop-by-product/accessories/hats-gloves-scarves.html', source: 'hm' },
];

function sanitizeLink(url) {
  if (!url || typeof url !== 'string') return '';
  const value = url.trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return '';
}

function toAmazonSearchUrl(name) {
  if (!name) return '';
  const query = encodeURIComponent(name);
  return `https://www.amazon.in/s?k=${query}`;
}

async function getRotationOffset() {
  try {
    const raw = await AsyncStorage.getItem(MARKETPLACE_ROTATION_KEY);
    const value = Number(raw || 0);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

async function setRotationOffset(value) {
  try {
    await AsyncStorage.setItem(MARKETPLACE_ROTATION_KEY, String(value));
  } catch {
    // no-op
  }
}

function rotateProducts(products, offset) {
  if (!Array.isArray(products) || products.length === 0) return [];
  const normalizedOffset = ((offset % products.length) + products.length) % products.length;
  return [...products.slice(normalizedOffset), ...products.slice(0, normalizedOffset)];
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
  const link =
    sanitizeLink(item.affiliateUrl) ||
    sanitizeLink(item.url) ||
    sanitizeLink(item.link) ||
    sanitizeLink(item.productUrl) ||
    sanitizeLink(item?.links?.product) ||
    sanitizeLink(item?.links?.affiliate) ||
    sanitizeLink(item?.product?.url) ||
    fallbackLink;

  const amount = Number(item.price ?? item.amount ?? item.salePrice ?? 0);

  return {
    id: String(item.id || item.productId || `remote-${index}`),
    name: item.name || item.title || 'Untitled product',
    brand: item.brand || item.vendor || 'Brand',
    category,
    price: Number.isFinite(amount) ? amount : 0,
    currency: item.currency || '₹',
    imageUrl: item.imageUrl || item.image || item.thumbnail || '',
    description: item.description || 'Fashion product',
    affiliateUrl: link,
    deepLinkUrl: item.deepLinkUrl || '',
    source: item.source || item.marketplace || 'partner',
  };
}

async function fetchDummyProductsFallback() {
  return CURATED_PRODUCTS.map((item, index) => normalizeProduct(item, index));
}

export async function fetchMarketplaceProducts() {
  let products = [];

  if (MARKETPLACE_API_URL) {
    try {
      const response = await fetch(MARKETPLACE_API_URL);
      if (response.ok) {
        const payload = await response.json();
        const rawProducts = Array.isArray(payload) ? payload : payload.products || [];
        products = rawProducts
          .map((item, index) => normalizeProduct(item, index))
          .filter((item) => item.affiliateUrl);
      }
    } catch {
      products = [];
    }
  }

  if (products.length === 0) {
    products = await fetchDummyProductsFallback();
  }

  if (products.length === 0) {
    return DEFAULT_PRODUCTS;
  }

  const offset = await getRotationOffset();
  const rotated = rotateProducts(products, offset);
  await setRotationOffset(offset + ROTATION_STEP);
  return rotated;
}

export async function getSavedMarketplaceItems() {
  try {
    const raw = await AsyncStorage.getItem(SAVED_MARKETPLACE_ITEMS_KEY);
    if (!raw) {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_SAVED_MARKETPLACE_ITEMS_KEY);
      if (legacyRaw) {
        await AsyncStorage.setItem(SAVED_MARKETPLACE_ITEMS_KEY, legacyRaw);
        await AsyncStorage.removeItem(LEGACY_SAVED_MARKETPLACE_ITEMS_KEY);
        const legacyItems = JSON.parse(legacyRaw || '[]');
        return Array.isArray(legacyItems) ? legacyItems : [];
      }
    }

    const items = JSON.parse(raw || '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function toggleSavedMarketplaceItem(item) {
  const savedItems = await getSavedMarketplaceItems();
  const exists = savedItems.some((saved) => saved.id === item.id);

  const nextItems = exists
    ? savedItems.filter((saved) => saved.id !== item.id)
    : [{ ...item, savedAt: new Date().toISOString() }, ...savedItems];

  try {
    await AsyncStorage.setItem(SAVED_MARKETPLACE_ITEMS_KEY, JSON.stringify(nextItems));
  } catch {
    // no-op
  }

  return {
    items: nextItems,
    saved: !exists,
  };
}

export async function clearMarketplaceWishlist() {
  try {
    await AsyncStorage.removeItem(SAVED_MARKETPLACE_ITEMS_KEY);
    await AsyncStorage.removeItem(LEGACY_SAVED_MARKETPLACE_ITEMS_KEY);
  } catch {
    // no-op
  }
}

export async function resetMarketplaceRotation() {
  try {
    await AsyncStorage.removeItem(MARKETPLACE_ROTATION_KEY);
  } catch {
    // no-op
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