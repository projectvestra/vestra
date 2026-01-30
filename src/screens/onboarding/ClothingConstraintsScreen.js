import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ClothingConstraintsScreen() {
  return (
    <View style={styles.container}>
      {/* Progress */}
      <Text style={styles.progress}>Step 4 of 4</Text>

      {/* Title */}
      <Text style={styles.title}>Any clothing preferences?</Text>
      <Text style={styles.subtitle}>
        Let us know if you avoid or prefer certain clothing.
      </Text>

      {/* Options (UI-only) */}
      <View style={styles.optionsContainer}>
        <View style={styles.option}><Text>No Sleeveless</Text></View>
        <View style={styles.option}><Text>Loose Fit</Text></View>
        <View style={styles.option}><Text>Formal Wear Only</Text></View>
        <View style={styles.option}><Text>No Leather</Text></View>
      </View>

      {/* Finish */}
      <TouchableOpacity style={styles.finishButton}>
        <Text style={styles.finishButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  progress: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginBottom: 28,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  finishButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  finishButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});
