import { useState, useEffect } from 'react';
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

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Shoes', 'Accessories'];

export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allItems, setAllItems] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getUserWardrobeItems();
      setAllItems(data.items || []);
    } catch (error) {
      console.log('Wardrobe fetch error:', error);
    }
  };

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All'
    ? allItems
    : allItems.filter(item => {
        const cat = (item.category || item.name || '').toLowerCase();
        const selected = selectedCategory.toLowerCase();
        // Match singular and plural — "Shirts" matches "shirt", "shirts" etc
        return cat.includes(selected.slice(0, -1)) || cat === selected.toLowerCase();
      });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Wardrobe</Text>
      <Text style={styles.subtitle}>{allItems.length} items</Text>

      {/* Generate Outfit Button */}
      <TouchableOpacity
        style={styles.generateBtn}
        onPress={() => setShowAssistant(true)}
      >
        <Text style={styles.generateBtnText}>✦ Generate Outfit</Text>
      </TouchableOpacity>

      {/* Category Filter */}
      <View style={styles.categories}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.category,
              selectedCategory === category && styles.activeCategory,
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.activeCategoryText,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Item count for current filter */}
      {selectedCategory !== 'All' && (
        <Text style={styles.filterCount}>
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  generateBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  generateBtnText: {
    color: '#fff',
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
    borderBottomColor: '#000',
  },
  categoryText: {
    fontSize: 13,
    color: '#777',
  },
  activeCategoryText: {
    color: '#000',
    fontWeight: '600',
  },
  filterCount: {
    fontSize: 12,
    color: '#999',
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
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});