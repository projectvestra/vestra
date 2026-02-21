// Mock search/catalog service — replace with API later

const items = [
  { id: '1', name: 'White Sneakers', category: 'Footwear' },
  { id: '2', name: 'Blue Denim Jacket', category: 'Outerwear' },
  { id: '3', name: 'Black T-Shirt', category: 'Topwear' },
  { id: '4', name: 'Slim Fit Jeans', category: 'Bottomwear' },
];

export function getSearchItems() {
  return items;
}

export function searchItems(query) {
  if (!query || !query.trim()) return items;

  const lower = query.toLowerCase();

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower)
  );
}