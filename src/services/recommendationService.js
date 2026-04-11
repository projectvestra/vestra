// src/services/recommendationService.js
import Constants from 'expo-constants';
import { getUserWardrobeItems } from './cloudWardrobeService';

const expoExtra = Constants.expoConfig?.extra || {};
const configuredRecommendationApiUrl =
  expoExtra.recommendation?.apiUrl ||
  expoExtra.backend?.apiUrl ||
  process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_API_URL ||
  '';
const normalizedRecommendationApiUrl =
  configuredRecommendationApiUrl && !/^https?:\/\//i.test(configuredRecommendationApiUrl)
    ? `https://${configuredRecommendationApiUrl}`
    : configuredRecommendationApiUrl;
const API_BASE = normalizedRecommendationApiUrl.replace(/\/$/, '');

const RECOMMEND_TIMEOUT_MS = 12000;
const WEEKLY_PLAN_TIMEOUT_MS = 15000;

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Backend request failed (${response.status}): ${body || response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

const COLOR_HARMONY = {
  white:   { black:9, navy:9, grey:9, beige:8, tan:8, brown:7, white:4 },
  black:   { white:9, beige:9, tan:8, grey:8, navy:7, brown:7, black:4 },
  navy:    { white:9, beige:9, tan:9, grey:8, brown:7, black:7, navy:4 },
  grey:    { white:9, black:8, navy:8, beige:8, tan:8, brown:7, grey:5 },
  beige:   { brown:9, tan:9, navy:8, black:9, white:8, olive:8, beige:4 },
  brown:   { beige:9, tan:9, white:8, olive:8, navy:7, grey:7, brown:4 },
  tan:     { navy:9, beige:9, brown:8, white:8, black:8, grey:8, tan:4 },
  olive:   { tan:9, brown:9, beige:8, black:7, navy:7, white:7, olive:4 },
  red:     { white:8, black:7, navy:6, grey:7, red:3 },
  blue:    { white:8, grey:8, black:7, beige:7, blue:4 },
};

const OCCASION_TARGET = {
  'casual':      2.5,
  'office':      3.5,
  'date night':  4.0,
  'party':       3.5,
  'gym':         1.0,
  'beach':       1.5,
  'wedding':     4.5,
  'shopping':    2.5,
};

// Map your Firebase category names to top/bottom/shoes
function getItemCategory(item) {
  const cat = (item.category || item.name || '').toLowerCase();
  if (cat.includes('shirt') || cat.includes('top') || cat.includes('t-shirt') ||
      cat.includes('blouse') || cat.includes('jacket') || cat.includes('hoodie') ||
      cat.includes('sweater') || cat.includes('coat')) return 'top';
  if (cat.includes('pant') || cat.includes('jean') || cat.includes('trouser') ||
      cat.includes('chino') || cat.includes('short') || cat.includes('skirt')) return 'bottom';
  if (cat.includes('shoe') || cat.includes('sneaker') || cat.includes('boot') ||
      cat.includes('sandal') || cat.includes('loafer')) return 'shoes';
  return 'other';
}

function getColor(item) {
  // item.color is a hex string like #111111 from your Firebase
  // Try to map hex to color name, or use as-is
  const hex = (item.color || '').toLowerCase();
  const name = (item.colorName || '').toLowerCase();
  if (name) return name;
  // Basic hex to name mapping
  if (hex === '#ffffff' || hex === 'white') return 'white';
  if (hex === '#000000' || hex === '#111111' || hex === 'black') return 'black';
  if (hex.includes('navy') || hex === '#000080') return 'navy';
  if (hex.includes('grey') || hex.includes('gray') || hex === '#808080') return 'grey';
  if (hex.includes('beige') || hex === '#f5f5dc') return 'beige';
  if (hex.includes('brown') || hex === '#8b4513') return 'brown';
  if (hex.includes('tan') || hex === '#d2b48c') return 'tan';
  if (hex.includes('olive') || hex === '#808000') return 'olive';
  return 'grey'; // default neutral
}

function scoreOutfitLocal(top, bottom, shoes, occasion = 'casual', tempC = 22) {
  const tc = getColor(top);
  const bc = getColor(bottom);
  const sc = getColor(shoes);

  const colorScore = (
    (COLOR_HARMONY[tc]?.[bc] || 6) * 0.4 +
    (COLOR_HARMONY[tc]?.[sc] || 6) * 0.3 +
    (COLOR_HARMONY[bc]?.[sc] || 6) * 0.3
  );

  const formalityMap = { top: 3, bottom: 3, shoes: 3 };
  const spread = 0; // simplified — no formality data in your Firebase yet
  const coherence = Math.max(0, 10 - spread * 2.5);

  const target = OCCASION_TARGET[occasion] || 3.0;
  const occasionScore = Math.max(0, 10 - Math.abs(3 - target) * 2);

  const total = colorScore * 0.4 + coherence * 0.35 + occasionScore * 0.25;
  return {
    total: Math.min(10, Math.max(1, parseFloat(total.toFixed(2)))),
    color: parseFloat(colorScore.toFixed(2)),
    coherence: parseFloat(coherence.toFixed(2)),
    occasion: parseFloat(occasionScore.toFixed(2)),
  };
}

export function generateCombinations(wardrobe, occasion, tempC, lockedTop, lockedBottom, lockedShoes) {
  const tops    = lockedTop    ? [lockedTop]    : wardrobe.filter(i => getItemCategory(i) === 'top');
  const bottoms = lockedBottom ? [lockedBottom] : wardrobe.filter(i => getItemCategory(i) === 'bottom');
  const shoes   = lockedShoes  ? [lockedShoes]  : wardrobe.filter(i => getItemCategory(i) === 'shoes');

  if (!tops.length || !bottoms.length || !shoes.length) return [];

  const results = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const score = scoreOutfitLocal(top, bottom, shoe, occasion, tempC);
        results.push({ top, bottom, shoes: shoe, score });
      }
    }
  }

  return results.sort((a, b) => b.score.total - a.score.total).slice(0, 20);
}

export async function getRecommendations({
  occasion = 'casual',
  temperatureC = 22,
  lockedTop = null,
  lockedBottom = null,
  lockedShoes = null,
  wardrobe: passedWardrobe = null,
}) {
  let wardrobe = passedWardrobe;
  if (!wardrobe || wardrobe.length === 0) {
    const wardrobeData = await getUserWardrobeItems();
    wardrobe = wardrobeData?.items || [];
  }
  
  console.log('Final wardrobe count:', wardrobe.length);

  if (wardrobe.length < 3) {
    return { outfits: [], error: 'Add at least 3 items to your wardrobe first' };
  }

  if (!API_BASE) {
    console.log('[recommendationService] getRecommendations: backend URL missing, using local scoring');
    const outfits = generateCombinations(wardrobe, occasion, temperatureC, lockedTop, lockedBottom, lockedShoes);
    return { outfits, source: 'local' };
  }

  // Try Python backend first
  try {
    console.log('[recommendationService] getRecommendations: trying backend', {
      occasion,
      temperatureC,
      wardrobeCount: wardrobe.length,
    });
    const formData = new FormData();
    formData.append('occasion', occasion);
    formData.append('temperature_c', String(temperatureC));
    formData.append('wardrobe_json', JSON.stringify(wardrobe));
    if (lockedTop) formData.append('locked_top_id', lockedTop.id);
    if (lockedBottom) formData.append('locked_bottom_id', lockedBottom.id);
    if (lockedShoes) formData.append('locked_shoes_id', lockedShoes.id);

    const data = await fetchJsonWithTimeout(`${API_BASE}/recommend`, {
      method: 'POST',
      body: formData,
    }, RECOMMEND_TIMEOUT_MS);

    console.log('[recommendationService] getRecommendations: backend response', {
      source: data?.source || 'ai',
      outfits: Array.isArray(data?.outfits) ? data.outfits.length : 0,
    });
    return { outfits: data.outfits, source: 'ai' };

  } catch (e) {
    // Backend not running — fall back to local scoring
    const reason = e?.name === 'AbortError' ? `timeout after ${RECOMMEND_TIMEOUT_MS}ms` : e;
    console.log('[recommendationService] getRecommendations: falling back to local scoring', reason);
    const outfits = generateCombinations(wardrobe, occasion, temperatureC, lockedTop, lockedBottom, lockedShoes);
    return { outfits, source: 'local' };
  }
}

export { getItemCategory, getColor };

export async function getAIWeeklyPlan(wardrobe, occasions) {
  try {
    if (!API_BASE) {
      console.log('[recommendationService] getAIWeeklyPlan: backend URL missing, using local planner flow');
      return null;
    }

    console.log('[recommendationService] getAIWeeklyPlan: trying backend', {
      wardrobeCount: Array.isArray(wardrobe) ? wardrobe.length : 0,
      occasions,
    });
    const formData = new FormData();
    formData.append('wardrobe_json', JSON.stringify(wardrobe));
    formData.append('occasions_json', JSON.stringify(occasions));

    const data = await fetchJsonWithTimeout(`${API_BASE}/weekly-plan`, {
      method: 'POST',
      body: formData,
    }, WEEKLY_PLAN_TIMEOUT_MS);

    console.log('[recommendationService] getAIWeeklyPlan: backend response', {
      source: data?.source || 'ai',
      hasPlan: !!data?.plan && Object.keys(data.plan || {}).length > 0,
    });
    return data;
  } catch (e) {
    console.log('[recommendationService] getAIWeeklyPlan: backend unavailable, using local planner flow', e);
    return null;
  }
} 