import { View, Text, StyleSheet } from 'react-native';

export default function TodayOutfitCard({ outfit }) {
  if (!outfit) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today’s Outfit</Text>
      <Text>{outfit.top}</Text>
      <Text>{outfit.bottom}</Text>
      <Text>{outfit.footwear}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});
