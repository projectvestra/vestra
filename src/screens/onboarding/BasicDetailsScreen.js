import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';

export default function BasicDetailsScreen() {
  const router = useRouter();
  const { updatePreferences } = useOnboarding();
  const { theme } = useTheme();

  const [height, setHeight] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');

  const bodyTypes = [
    "Slim", "Athletic", "Average", "Curvy", "Plus Size"
  ];

  const handleContinue = () => {
    updatePreferences({
      height: height ? parseInt(height) : null,
      bodyType: selectedBodyType
    });

    router.push('/onboarding/step2');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.progress, { color: theme.text3 }]}>Step 1 of 4</Text>

        <Text style={[styles.title, { color: theme.text }]}>Tell us about yourself</Text>
        <Text style={[styles.subtitle, { color: theme.text2 }]}>
          This helps us personalize your outfit suggestions.
        </Text>

        <TextInput
          placeholder="Height (cm)"
          placeholderTextColor={theme.text3}
          keyboardType="numeric"
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
          value={height}
          onChangeText={setHeight}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Body Type</Text>
        <View style={styles.bodyTypesContainer}>
          {bodyTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.bodyTypeOption,
                { borderColor: theme.border, backgroundColor: theme.card },
                selectedBodyType === type && [styles.selected, { backgroundColor: theme.tint }]
              ]}
              onPress={() => setSelectedBodyType(type)}
            >
              <Text style={[
                styles.bodyTypeText,
                { color: theme.text },
                selectedBodyType === type && { color: theme.bg }
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, { color: theme.bg }]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  progress: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: '500', marginBottom: 16 },
  bodyTypesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 },
  bodyTypeOption: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 12,
  },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  bodyTypeText: { fontSize: 16 },
  button: { paddingVertical: 16, borderRadius: 12, marginTop: 12 },
  buttonText: { textAlign: 'center', fontSize: 16, fontWeight: '500' }
});