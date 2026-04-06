import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProfileSectionCard({ title, children }) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      {title && <Text style={[styles.title, { color: theme.icon }]}>{title}</Text>}
      <View style={[styles.card, { backgroundColor: theme.bg2 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
});