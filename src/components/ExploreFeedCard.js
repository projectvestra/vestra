import { View, Text, StyleSheet } from 'react-native';

export default function ExploreFeedCard({ item }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.summary}>{item.summary}</Text>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  summary: {
    fontSize: 14,
    color: '#555',
  },
});
