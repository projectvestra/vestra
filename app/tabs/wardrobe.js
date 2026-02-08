import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { getWardrobeItems } from '../../src/services/wardrobeService';
const items = getWardrobeItems();
import WardrobeItemCard from '../../src/components/WardrobeItemCard';

const CATEGORIES = ['shirts', 'pants', 'shoes', 'accessories'];

export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState('shirts');

  const items = getWardrobeItems().filter(
    (item) => item.category === selectedCategory
  );

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.tabs}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.tab,
              selectedCategory === category && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === category && styles.activeTabText,
              ]}
            >
              {category.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items Grid */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <WardrobeItemCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 13,
    color: '#777',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  list: {
    padding: 8,
  },
});
