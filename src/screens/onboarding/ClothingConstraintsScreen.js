import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import {
  setOnboardingCompleted,
} from '../../services/userPreferencesService';
import { createUserProfile } from '../../services/userService';

export default function ClothingConstraintsScreen() {
  const router = useRouter();
  const { preferences, updatePreferences } = useOnboarding();
  const { theme } = useTheme();

  const [selectedConstraints, setSelectedConstraints] = useState([]);

  const constraintsList = [
    "No Sleeveless",
    "Loose Fit",
    "Formal Wear Only",
    "No Leather",
    "No Synthetic Materials",
    "Modest Clothing",
    "No Bright Colors",
    "Comfortable Shoes Only"
  ];

  const toggleConstraint = (constraint) => {
    if (selectedConstraints.includes(constraint)) {
      setSelectedConstraints(
        selectedConstraints.filter(c => c !== constraint)
      );
    } else {
      setSelectedConstraints([...selectedConstraints, constraint]);
    }
  };

  const handleFinish = async () => {
    updatePreferences({ constraints: selectedConstraints });

    const finalPreferences = {
      ...preferences,
      constraints: selectedConstraints
    };

    await createUserProfile(finalPreferences);
    await setOnboardingCompleted();

    router.replace('/tabs/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.progress, { color: theme.text3 }]}>Step 4 of 4</Text>

      <Text style={[styles.title, { color: theme.text }]}>Any clothing preferences?</Text>
      <Text style={[styles.subtitle, { color: theme.text2 }]}>
        Let us know if you have any restrictions or preferences.
      </Text>

      <View style={styles.constraintsContainer}>
        {constraintsList.map(constraint => (
          <TouchableOpacity
            key={constraint}
            style={[
              styles.constraintOption,
              { borderColor: theme.border, backgroundColor: theme.card },
              selectedConstraints.includes(constraint) && [styles.selected, { backgroundColor: theme.tint }]
            ]}
            onPress={() => toggleConstraint(constraint)}
          >
            <Text style={[
              styles.constraintText,
              { color: theme.text },
              selectedConstraints.includes(constraint) && { color: theme.bg }
            ]}>
              {constraint}
            </Text>
            {selectedConstraints.includes(constraint) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text2 }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={handleFinish}
        >
          <Text style={[styles.primaryButtonText, { color: theme.bg }]}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  progress: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 28 },
  constraintsContainer: { marginBottom: 32 },
  constraintOption: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    position: 'relative'
  },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  constraintText: { fontSize: 16, fontWeight: '500' },
  checkmark: { position: 'absolute', top: 8, right: 12, backgroundColor: '#007AFF', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  checkmarkText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  secondaryButton: { paddingVertical: 14, paddingHorizontal: 24, borderWidth: 1, borderRadius: 10 },
  secondaryButtonText: { fontSize: 15 },
  primaryButton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 },
  primaryButtonText: { fontSize: 15, fontWeight: '500' }
});