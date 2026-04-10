import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { getUserWardrobeItems } from '../../src/services/cloudWardrobeService';
import WardrobeItemCard from '../../src/components/WardrobeItemCard';
import StyleAssistantModal from '../../src/components/home/StyleAssistantModal';
import { useTheme } from '../../src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

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
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();


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
    }, [loadData])
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
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  generateBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '600',
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
});