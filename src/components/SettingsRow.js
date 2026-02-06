import { View, Text, StyleSheet } from 'react-native';

export default function SettingsRow({ label }) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  text: {
    fontSize: 15,
    color: '#111',
  },
});
