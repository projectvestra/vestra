import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';

import {
  fetchWardrobeItems,
  addWardrobeItem,
} from '../../src/services/wardrobeService';
import WardrobeItemCard from '../../src/components/WardrobeItemCard';

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Shoes', 'Accessories'];

export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Expose add-item trigger for central "+" button
  useEffect(() => {
    global.openAddWardrobeItem = () => {
      setShowAddModal(true);
    };

    return () => {
      global.openAddWardrobeItem = undefined;
    };
  }, []);

  const wardrobeData = fetchWardrobeItems(selectedCategory);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Wardrobe</Text>

      {/* Item count */}
      <Text style={styles.subtitle}>
        {wardrobeData.totalCount} items
      </Text>

      {/* Categories */}
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
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.activeCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid / Empty state */}
      {wardrobeData.items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No items in this category yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={wardrobeData.items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => <WardrobeItemCard item={item} />}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                addWardrobeItem({
                  name: 'New Item',
                  category:
                    selectedCategory === 'All'
                      ? 'Shirts'
                      : selectedCategory,
                  color: '#cccccc',
                  image: null,
                });
                setShowAddModal(false);
              }}
            >
              <Text>Add manually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setShowAddModal(false)}
            >
              <Text>Add from gallery (coming soon)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={{ color: '#fff' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 12,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
});
