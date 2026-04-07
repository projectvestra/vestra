import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import {
  fetchMarketplaceProducts,
  filterByCategory,
  sortByPrice,
} from '../../src/services/marketplaceService';
import MarketplaceProductCard from '../../src/components/MarketplaceProductCard';

const categories = ['All', 'Shirts', 'Pants', 'Shoes', 'Accessories'];

export default function Marketplace() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredProducts = useMemo(() => {
    let products =
      selectedCategory === 'All'
        ? allProducts
        : filterByCategory(allProducts, selectedCategory);

    products = sortByPrice(products, sortOrder);

    return products;
  }, [allProducts, selectedCategory, sortOrder]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      const products = await fetchMarketplaceProducts();
      if (active) {
        setAllProducts(products);
        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }] }>
      <Text style={[styles.title, { color: theme.text }]}>Marketplace</Text>

      {/* Category Filters */}
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              { backgroundColor: selectedCategory === cat ? theme.tint : theme.bg2 },
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === cat ? '#fff' : theme.text },
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
        <Text style={[styles.sortText, { color: theme.text2 }] }>
          Sort: Price {sortOrder === 'asc' ? 'Low → High' : 'High → Low'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MarketplaceProductCard product={item} />
          )}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: theme.text2 }]}>No products available right now.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
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
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
  },
  sortButton: {
    marginBottom: 12,
  },
  sortText: {
    fontSize: 13,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});