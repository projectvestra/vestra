import { View, Text, StyleSheet } from 'react-native';

export default function GreetingSection({
  name,
  totalItems,
  recentItem,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Good Evening, {name}
      </Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Total Items: {totalItems}
        </Text>

        {recentItem && (
          <Text style={styles.summaryText}>
            Recently Added: {recentItem.name}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
  },
  summaryBox: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});
