// Mock wardrobe service — backend-ready shape

let wardrobeItems = [
  {
    id: '1',
    name: 'White Shirt',
    category: 'Shirts',
    color: '#ffffff',
    image: null,
  },
  {
    id: '2',
    name: 'Blue Shirt',
    category: 'Shirts',
    color: '#4a6cf7',
    image: null,
  },
  {
    id: '3',
    name: 'Black Jeans',
    category: 'Pants',
    color: '#111111',
    image: null,
  },
];

export function fetchWardrobeItems(category = 'All') {
  const items =
    category === 'All'
      ? wardrobeItems
      : wardrobeItems.filter((item) => item.category === category);

  return {
    totalCount: items.length,
    items,
  };
}

export function addWardrobeItem(item) {
  wardrobeItems = [
    ...wardrobeItems,
    {
      id: Date.now().toString(),
      ...item,
    },
  ];

  return wardrobeItems;
}
