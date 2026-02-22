import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

export default function ProfileStatCard({ value, label }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    margin: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  label: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 4,
  },
});