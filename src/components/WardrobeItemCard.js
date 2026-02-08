import { View, Text, StyleSheet } from 'react-native';

export default function WardrobeItemCard({ item }) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.imagePlaceholder,
          { backgroundColor: item.color || '#eee' },
        ]}
      />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
  },
  imagePlaceholder: {
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
