import { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserWardrobeItems } from '../../src/services/cloudWardrobeService';
import WardrobeItemCard from '../../src/components/WardrobeItemCard';
import StyleAssistantModal from '../../src/components/home/StyleAssistantModal';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ui } from '../../src/theme/ui';

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Shoes', 'Accessories', 'Jackets', 'Hoodies', 'Sunglasses'];

const CATEGORY_MAP = {
  Shirts: ['shirt', 'top', 'blouse', 't-shirt'],
  Pants: ['pant', 'jean', 'trouser', 'chino', 'short', 'skirt'],
  Shoes: ['shoe', 'sneaker', 'boot', 'sandal', 'loafer'],
  Accessories: ['bag', 'belt', 'scarf', 'hat', 'watch', 'jewelry', 'bag'],
  Jackets: ['jacket', 'coat', 'blazer', 'parka'],
  Hoodies: ['hoodie', 'sweater', 'crewneck'],
  Sunglasses: ['sunglass', 'sunny', 'shades'],
};

export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortDirection, setSortDirection] = useState('desc');
  const [allItems, setAllItems] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerTimerRef = useRef(null);


  const loadData = useCallback(async () => {
    try {
      const data = await getUserWardrobeItems();
      setAllItems(data.items || []);
    } catch (error) {
      console.log('Wardrobe fetch error:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      if (params.toast === 'item-added') {
        setBannerText('✨ Item added to your wardrobe');
        bannerOpacity.setValue(0);
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();

        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => {
          Animated.timing(bannerOpacity, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }).start(() => setBannerText(''));
        }, 2200);

        return () => {
          if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        };
      }
    }, [loadData, params.toast])
  );

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    const base = selectedCategory === 'All'
      ? allItems
      : allItems.filter(item => {
          const cat = (item.category || item.name || '').toLowerCase();
          const matchers = CATEGORY_MAP[selectedCategory] || [selectedCategory.toLowerCase()];
          return matchers.some(term => cat.includes(term));
        });

    const toTime = (item) => {
      const raw = item?.createdAt || item?.updatedAt || item?.addedAt || item?.timestamp;
      if (!raw) return 0;
      if (typeof raw === 'number') return raw;
      if (typeof raw === 'string') {
        const t = Date.parse(raw);
        return Number.isNaN(t) ? 0 : t;
      }
      if (raw?.seconds) return raw.seconds * 1000;
      if (raw?.toDate) {
        const d = raw.toDate();
        return d?.getTime?.() || 0;
      }
      return 0;
    };

    return [...base].sort((a, b) => {
      const diff = toTime(a) - toTime(b);
      return sortDirection === 'desc' ? -diff : diff;
    });
  }, [allItems, selectedCategory, sortDirection]);

  const keyExtractor = useCallback((item) => item.id, []);
  const renderItem = useCallback(({ item }) => (
    <WardrobeItemCard item={item} onDelete={loadData} onEdit={loadData} />
  ), [loadData]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top}]}>
      {bannerText ? (
        <Animated.View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.border, opacity: bannerOpacity }]}>
          <Text style={[styles.bannerText, { color: theme.text }]}>{bannerText}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.topRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>My Wardrobe</Text>
          <Text style={[styles.subtitle, { color: theme.text2 }]}>{allItems.length} items</Text>
        </View>
        <Pressable
          onPress={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
          style={({ pressed }) => [styles.sortIconBtn, { borderColor: theme.border, backgroundColor: theme.bg2, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={[styles.sortIcon, { color: theme.text }]}>{sortDirection === 'desc' ? '↓' : '↑'}</Text>
        </Pressable>
      </View>

      {/* Generate Outfit Button */}
      <Pressable
        style={({ pressed }) => [styles.generateBtn, { backgroundColor: theme.tint, opacity: pressed ? 0.92 : 1 }]}
        onPress={() => setShowAssistant(true)}
      >
        <Text style={[styles.generateBtnText, { color: theme.bg }]}>✦ Generate Outfit</Text>
      </Pressable>

      {/* Category Filter */}
      <View style={styles.categories}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={({ pressed }) => [
              styles.category,
              selectedCategory === category && [styles.activeCategory, { borderBottomColor: theme.tint }],
              pressed && { opacity: 0.82 },
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category ? theme.tint : theme.text2 },
              selectedCategory === category && styles.activeCategoryText,
            ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Item count for current filter */}
      {selectedCategory !== 'All' && (
        <Text style={[styles.filterCount, { color: theme.text2 }]}>
          {filteredItems.length} {selectedCategory.toLowerCase()}
        </Text>
      )}

      {/* Item List */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {selectedCategory === 'All'
              ? 'No items yet — tap + to add clothes'
              : `No ${selectedCategory.toLowerCase()} yet`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={keyExtractor}
          numColumns={2}
          removeClippedSubviews
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={8}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
        />
      )}

      {/* Style Assistant Modal */}
      <StyleAssistantModal
        visible={showAssistant}
        onClose={() => setShowAssistant(false)}
        wardrobe={allItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: ui.type.title,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: -0.4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  sortIcon: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  generateBtn: {
    borderRadius: ui.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  category: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  activeCategory: {
    borderBottomWidth: 2,
  },
  categoryText: {
    fontSize: 13,
  },
  activeCategoryText: {
    fontWeight: '700',
  },
  filterCount: {
    fontSize: 12,
    marginTop: 8,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  banner: {
    marginTop: 8,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: ui.radius.md,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});