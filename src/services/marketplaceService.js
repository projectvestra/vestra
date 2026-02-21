// src/services/marketplaceService.js

// Mock curated affiliate product data
// Replace with backend API later

const products = [
  {
    id: '1',
    name: 'Slim Fit Oxford Shirt',
    brand: 'H&M',
    category: 'Shirts',
    price: 1999,
    currency: '₹',
    imageUrl:
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
    description: 'Premium cotton slim fit shirt for everyday wear.',
    affiliateUrl: 'https://example.com/affiliate/shirt1',
    source: 'amazon',
  },
  {
    id: '2',
    name: 'Classic Blue Denim',
    brand: 'Levis',
    category: 'Pants',
    price: 3499,
    currency: '₹',
    imageUrl:
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb',
    description: 'Stretchable slim-fit denim with modern silhouette.',
    affiliateUrl: 'https://example.com/affiliate/pants1',
    source: 'myntra',
  },
  {
    id: '3',
    name: 'Urban White Sneakers',
    brand: 'Nike',
    category: 'Shoes',
    price: 5999,
    currency: '₹',
    imageUrl:
      'https://images.unsplash.com/photo-1528701800489-20be3c9e40a2',
    description: 'Minimal everyday sneakers with cushioned sole.',
    affiliateUrl: 'https://example.com/affiliate/shoes1',
    source: 'amazon',
  },
  {
    id: '4',
    name: 'Leather Strap Watch',
    brand: 'Fossil',
    category: 'Accessories',
    price: 7499,
    currency: '₹',
    imageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552',
    description: 'Elegant brown leather strap with steel case.',
    affiliateUrl: 'https://example.com/affiliate/watch1',
    source: 'partner',
  },
];

export function fetchMarketplaceProducts() {
  return products;
}

export function filterByCategory(productList, category) {
  if (!category) return productList;
  return productList.filter((item) => item.category === category);
}

export function sortByPrice(productList, order = 'asc') {
  const sorted = [...productList].sort((a, b) => a.price - b.price);
  return order === 'asc' ? sorted : sorted.reverse();
}