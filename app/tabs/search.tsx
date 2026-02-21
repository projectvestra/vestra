import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useState, useMemo } from 'react';
import {
  fetchMarketplaceProducts,
  filterByCategory,
  sortByPrice,
} from '../../src/services/marketplaceService';
import MarketplaceProductCard from '../../src/components/MarketplaceProductCard';
import { Colors } from '../../constants/theme';

const categories = ['All', 'Shirts', 'Pants', 'Shoes', 'Accessories'];

export default function Marketplace() {
  const allProducts = fetchMarketplaceProducts();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredProducts = useMemo(() => {
    let products =
      selectedCategory === 'All'
        ? allProducts
        : filterByCategory(allProducts, selectedCategory);

    products = sortByPrice(products, sortOrder);

    return products;
  }, [selectedCategory, sortOrder]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>

      {/* Category Filters */}
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort Toggle */}
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() =>
          setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        }
      >
        <Text style={styles.sortText}>
          Sort: Price {sortOrder === 'asc' ? 'Low → High' : 'High → Low'}
        </Text>
      </TouchableOpacity>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MarketplaceProductCard product={item} />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.light.text,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryActive: {
    backgroundColor: Colors.light.tint,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.text,
  },
  categoryTextActive: {
    color: '#fff',
  },
  sortButton: {
    marginBottom: 12,
  },
  sortText: {
    fontSize: 13,
    color: Colors.light.icon,
  },
});