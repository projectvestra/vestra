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
