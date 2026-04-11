import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
  const [allItems, setAllItems] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams();


  const loadData = useCallback(async () => {
    try {
      const data = await getUserWardrobeItems();
      setAllItems(data.items || []);
    } catch (error) {
      console.log('Wardrobe fetch error:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      if (params.toast === 'item-added') {
        setBannerText('✨ Item added to your wardrobe');
        const timer = setTimeout(() => setBannerText(''), 1800);
        return () => clearTimeout(timer);
      }
    }, [loadData, params.toast])
  );

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All'
    ? allItems
    : allItems.filter(item => {
        const cat = (item.category || item.name || '').toLowerCase();
        const matchers = CATEGORY_MAP[selectedCategory] || [selectedCategory.toLowerCase()];
        return matchers.some(term => cat.includes(term));
      });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top}]}>
      {bannerText ? (
        <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.bannerText, { color: theme.text }]}>{bannerText}</Text>
        </View>
      ) : null}

      <Text style={[styles.title, { color: theme.text }]}>My Wardrobe</Text>
      <Text style={[styles.subtitle, { color: theme.text2 }]}>{allItems.length} items</Text>

      {/* Generate Outfit Button */}
      <TouchableOpacity
        style={[styles.generateBtn, { backgroundColor: theme.tint }]}
        onPress={() => setShowAssistant(true)}
      >
        <Text style={[styles.generateBtnText, { color: theme.bg }]}>✦ Generate Outfit</Text>
      </TouchableOpacity>

      {/* Category Filter */}
      <View style={styles.categories}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.category,
              selectedCategory === category && [styles.activeCategory, { borderBottomColor: theme.tint }],
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category ? theme.tint : theme.text2 },
              selectedCategory === category && styles.activeCategoryText,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
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
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <WardrobeItemCard item={item} onDelete={loadData} onEdit={loadData} />
          )}
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
    marginTop: 16,
    letterSpacing: -0.4,
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