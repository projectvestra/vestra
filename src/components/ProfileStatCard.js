import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ui } from '../theme/ui';

export default function ProfileStatCard({ value, label }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.text2 }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 118,
    borderRadius: ui.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 72,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  label: {
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});