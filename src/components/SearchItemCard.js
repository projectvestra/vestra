import { View, Text, StyleSheet } from 'react-native';

export default function SearchItemCard({ item }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
    marginBottom: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  category: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
