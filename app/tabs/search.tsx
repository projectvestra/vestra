import { ScrollView, StyleSheet } from 'react-native';
import { getSearchItems } from '../../src/services/searchService';
import SearchItemCard from '../../src/components/SearchItemCard';

export default function Search() {
  const items = getSearchItems();

  return (
    <ScrollView style={styles.container}>
      {items.map((item) => (
        <SearchItemCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
