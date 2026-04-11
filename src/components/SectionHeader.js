import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ui } from '../theme/ui';

export default function SectionHeader({ title }) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.eyebrow, { color: theme.text2 }]}>Section</Text>
      <Text style={[styles.text, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: ui.spacing.sm,
  },
  eyebrow: {
    fontSize: ui.type.eyebrow,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  text: {
    fontSize: ui.type.section,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
