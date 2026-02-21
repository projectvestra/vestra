import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function QuickActionCard({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    padding: 16,
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    marginRight: 12,
  },
  text: {
    fontWeight: '500',
  },
});
