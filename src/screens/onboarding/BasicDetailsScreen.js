import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BasicDetailsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Progress */}
      <Text style={styles.progress}>Step 1 of 4</Text>

      {/* Title */}
      <Text style={styles.title}>Tell us about yourself</Text>
      <Text style={styles.subtitle}>
        This helps us personalize your outfit suggestions.
      </Text>

      {/* Inputs */}
      <TextInput
        placeholder="Height (cm)"
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Body Type (optional)"
        style={styles.input}
      />

      {/* Action */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/onboarding/step2')}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
    marginBottom: 12,
    textAlign: 'center',
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
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#111',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});
