import { fetchWardrobeItems } from './wardrobeService';

export async function getHomeSummary() {
  const allData = await fetchWardrobeItems('All');

  const totalItems = allData.totalCount;
  const items = allData.items;

  const recentItem =
    items.length > 0
      ? items[items.length - 1]
      : null;

  return {
    totalItems,
    recentItem,
  };
}
export async function getTodayOutfit() {
  const allData = await fetchWardrobeItems('All');
  const items = allData.items;

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

export async function getWeeklyPreview() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, index) => ({
    day,
    tag: index % 2 === 0 ? 'Casual' : 'Smart',
  }));
}
