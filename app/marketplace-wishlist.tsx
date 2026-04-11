import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import MarketplaceProductCard from '../src/components/MarketplaceProductCard';
import { getSavedMarketplaceItems, toggleSavedMarketplaceItem } from '../src/services/marketplaceService';

type MarketplaceProduct = {
  id: string;
  [key: string]: any;
};

export default function MarketplaceWishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadWishlist = useCallback(async () => {
    const saved = await getSavedMarketplaceItems();
    setItems(saved);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  const handleToggleSave = async (item: MarketplaceProduct) => {
    const result = await toggleSavedMarketplaceItem(item);
    setItems(result.items);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.text2 }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Wishlist</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <MarketplaceProductCard
            product={item}
            isSaved
            onToggleSave={() => handleToggleSave(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: theme.text2 }]}>No wishlisted items yet.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { fontSize: 13, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '700' },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 14 },
});
