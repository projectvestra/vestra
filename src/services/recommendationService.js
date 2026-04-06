// src/services/recommendationService.js
import { getUserWardrobeItems } from './cloudWardrobeService';

// Your PC's IP — run ipconfig to find it
// Must be on same WiFi as phone
const API_BASE = 'http://192.168.1.4:8000';

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

  // Try Python backend first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const formData = new FormData();
    formData.append('occasion', occasion);
    formData.append('temperature_c', String(temperatureC));
    formData.append('wardrobe_json', JSON.stringify(wardrobe));
    if (lockedTop) formData.append('locked_top_id', lockedTop.id);
    if (lockedBottom) formData.append('locked_bottom_id', lockedBottom.id);
    if (lockedShoes) formData.append('locked_shoes_id', lockedShoes.id);

    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();
    return { outfits: data.outfits, source: 'ai' };

  } catch (e) {
    // Backend not running — fall back to local scoring
    const outfits = generateCombinations(wardrobe, occasion, temperatureC, lockedTop, lockedBottom, lockedShoes);
    return { outfits, source: 'local' };
  }
}

export { getItemCategory, getColor };

export async function getAIWeeklyPlan(wardrobe, occasions) {
  try {
    const formData = new FormData();
    formData.append('wardrobe_json', JSON.stringify(wardrobe));
    formData.append('occasions_json', JSON.stringify(occasions));

    const res = await fetch(`${API_BASE}/weekly-plan`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('AI weekly plan error, using local:', e);
    return null;
  }
} 