import { View, Text, StyleSheet } from 'react-native';

export default function WardrobeItemCard({ item }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{item.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
});
