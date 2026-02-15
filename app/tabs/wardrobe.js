import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import { fetchWardrobeItems } from '../../src/services/wardrobeService';
import WardrobeItemCard from '../../src/components/WardrobeItemCard';

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Shoes', 'Accessories'];

export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wardrobeData, setWardrobeData] = useState({
    totalCount: 0,
    items: [],
  });

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    const data = await fetchWardrobeItems(selectedCategory);
    setWardrobeData(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Wardrobe</Text>

      <Text style={styles.subtitle}>
        {wardrobeData.totalCount} items
      </Text>

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
          contentContainerStyle = {styles.list}
          renderItem={({ item }) => (
            <WardrobeItemCard item={item}
            onDelete={loadData}
            />
          )}
        />
      )}
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
});
