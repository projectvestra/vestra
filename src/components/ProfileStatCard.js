import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ui } from '../theme/ui';

export default function ProfileStatCard({ value, label }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.text2 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: ui.radius.md,
    paddingVertical: ui.spacing.md,
    paddingHorizontal: ui.spacing.sm,
    alignItems: 'center',
    margin: 4,
    borderWidth: 1,
    minHeight: 78,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  label: {
    fontSize: 11,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});