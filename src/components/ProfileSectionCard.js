import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ui } from '../theme/ui';

export default function ProfileSectionCard({ title, children }) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      {title ? <Text style={[styles.title, { color: theme.text2 }]}>{title}</Text> : null}
      <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: ui.spacing.xl,
  },
  title: {
    fontSize: ui.type.eyebrow,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: ui.spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: ui.radius.lg,
    padding: ui.spacing.md,
    borderWidth: 1,
    ...ui.shadow.card,
  },
});