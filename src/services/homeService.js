import { getUserWardrobeItems } from './cloudWardrobeService';

/* ------------------------------------------
   Home Summary
------------------------------------------ */
export async function getHomeSummary() {
  const data = await getUserWardrobeItems();

  const items = data.items;

  return {
    totalItems: items.length,
    recentItem: items.length > 0 ? items[0] : null,
  };
}

/* ------------------------------------------
   Today Outfit
------------------------------------------ */
export async function getTodayOutfit() {
  const data = await getUserWardrobeItems();
  const items = data.items;

  const shirt = items.find(i => i.category === 'Shirts');
  const pants = items.find(i => i.category === 'Pants');
  const shoes = items.find(i => i.category === 'Shoes');

  return {
    shirt: shirt || null,
    pants: pants || null,
    shoes: shoes || null,
    explanation:
      "Balanced tones from your wardrobe create a clean and versatile look for today.",
  };
}

/* ------------------------------------------
   Weekly Preview (Mock)
------------------------------------------ */
export async function getWeeklyPreview() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, index) => ({
    day,
    tag: index % 2 === 0 ? 'Casual' : 'Smart',
  }));
}