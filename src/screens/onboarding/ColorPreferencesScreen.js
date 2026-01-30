import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ColorPreferencesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Progress */}
      <Text style={styles.progress}>Step 3 of 4</Text>

      {/* Title */}
      <Text style={styles.title}>Pick your colors</Text>
      <Text style={styles.subtitle}>
        Choose the colors you usually wear.
      </Text>

      {/* Color options (UI-only) */}
      <View style={styles.colorsGrid}>
        <View style={styles.colorOption}><Text>Black</Text></View>
        <View style={styles.colorOption}><Text>White</Text></View>
        <View style={styles.colorOption}><Text>Blue</Text></View>
        <View style={styles.colorOption}><Text>Brown</Text></View>
        <View style={styles.colorOption}><Text>Green</Text></View>
        <View style={styles.colorOption}><Text>Beige</Text></View>
      </View>

      {/* Navigation */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/onboarding/step4')}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  colorOption: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: '#555',
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
