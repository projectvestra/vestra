import { View, Text, StyleSheet } from 'react-native';

export default function WeeklyPreview({ weeklyData }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Preview</Text>
      <View style={styles.row}>
        {weeklyData.map((item) => (
          <View key={item.day} style={styles.dayCard}>
            <Text style={styles.day}>{item.day}</Text>
            <Text style={styles.tag}>{item.tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCard: {
    width: '22%',
    margin: '1%',
    padding: 8,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    alignItems: 'center',
  },
  day: {
    fontWeight: '600',
  },
  tag: {
    fontSize: 12,
    color: '#666',
  },
});
