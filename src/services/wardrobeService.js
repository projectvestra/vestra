import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'WARDROBE_ITEMS';

// Default seed data (only used first time)
const defaultItems = [
  {
    id: '1',
    name: 'White Shirt',
    category: 'Shirts',
    color: '#ffffff',
    image: null,
  },
  {
    id: '2',
    name: 'Black Jeans',
    category: 'Pants',
    color: '#111111',
    image: null,
  },
];

async function initializeStorage() {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);

  if (!existing) {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultItems)
    );
  }
}

export async function fetchWardrobeItems(category = 'All') {
  await initializeStorage();

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const items = stored ? JSON.parse(stored) : [];

  const filtered =
    category === 'All'
      ? items
      : items.filter((item) => item.category === category);

  return {
    totalCount: filtered.length,
    items: filtered,
  };
}

export async function addWardrobeItem(item) {
  await initializeStorage();

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const items = stored ? JSON.parse(stored) : [];

  const updated = [
    ...items,
    {
      id: Date.now().toString(),
      ...item,
    },
  ];

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return updated;
}
export async function deleteWardrobeItem(id) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const items = stored ? JSON.parse(stored) : [];

  const updated = items.filter((item) => item.id !== id);

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return updated;
}
