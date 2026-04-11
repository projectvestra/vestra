import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { ui } from '../../src/theme/ui';
import {
  fetchMarketplaceProducts,
  filterByCategory,
  sortByPrice,
  getSavedMarketplaceItems,
  toggleSavedMarketplaceItem,
} from '../../src/services/marketplaceService';
import MarketplaceProductCard from '../../src/components/MarketplaceProductCard';

const categories = ['All', 'Shirts', 'Pants', 'Shoes', 'Accessories'];

type MarketplaceProduct = {
  id: string;
  category: string;
  price: number;
  [key: string]: any;
};

export default function Marketplace() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<MarketplaceProduct[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      const [products, saved] = await Promise.all([
        fetchMarketplaceProducts(),
        getSavedMarketplaceItems(),
      ]);
      if (active) {
        setAllProducts(products);
        setSavedProductIds(saved.map((item) => item.id));
        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const products = await fetchMarketplaceProducts();
    setAllProducts(products);
    setRefreshing(false);
  };

  const handleToggleSave = async (product: MarketplaceProduct) => {
    const result = await toggleSavedMarketplaceItem(product);
    setSavedProductIds(result.items.map((item) => item.id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }] }>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Marketplace</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.wishlistBtn, { backgroundColor: theme.bg2 }]} onPress={() => router.push('/marketplace-wishlist' as any)}>
            <Text style={[styles.wishlistBtnText, { color: theme.text }]}>Wishlist</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.wishlistSummary, { color: theme.text2 }]}>
        Wishlist: {savedProductIds.length} item{savedProductIds.length === 1 ? '' : 's'}
      </Text>

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
            <MarketplaceProductCard
              product={item}
              isSaved={savedProductIds.includes(item.id)}
              onToggleSave={() => handleToggleSave(item)}
            />
          )}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
    padding: 16,
  },
  title: {
    fontSize: ui.type.title,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wishlistBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: ui.radius.pill,
  },
  wishlistBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  wishlistSummary: {
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: ui.radius.pill,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sortButton: {
    marginBottom: 12,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
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