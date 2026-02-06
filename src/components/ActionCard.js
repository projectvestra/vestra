import { View, Text, StyleSheet } from 'react-native';

export default function ActionCard({ title }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
});
