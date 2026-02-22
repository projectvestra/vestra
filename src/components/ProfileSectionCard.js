import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

export default function ProfileSectionCard({ title, children }) {
  return (
    <View style={styles.wrapper}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.card}>{children}</View>
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
    color: Colors.light.icon,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
  },
});