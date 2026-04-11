import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { ui } from '../../theme/ui';
import {
  setOnboardingCompleted,
} from '../../services/userPreferencesService';
import { createUserProfile } from '../../services/userService';

export default function ClothingConstraintsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      constraints: selectedConstraints,
      onboardingCompleted: true,
    };

    await createUserProfile(finalPreferences);
    await setOnboardingCompleted();

    router.replace('/tabs/home');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.contentCard, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
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
          style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.bg3 }]}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  contentCard: {
    borderWidth: 1,
    borderRadius: ui.radius.xl,
    padding: 18,
    ...ui.shadow.elevated,
  },
  progress: { fontSize: 12, textAlign: 'center', marginBottom: 12, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  constraintsContainer: { marginBottom: 32 },
  constraintOption: {
    borderWidth: 1,
    borderRadius: ui.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    position: 'relative'
  },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  constraintText: { fontSize: 14, fontWeight: '600' },
  checkmark: { position: 'absolute', top: 8, right: 12, backgroundColor: '#007AFF', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  checkmarkText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  secondaryButton: { paddingVertical: 14, paddingHorizontal: 24, borderWidth: 1, borderRadius: ui.radius.md, flex: 1, alignItems: 'center' },
  secondaryButtonText: { fontSize: 14, fontWeight: '600' },
  primaryButton: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: ui.radius.md, flex: 1, alignItems: 'center' },
  primaryButtonText: { fontSize: 15, fontWeight: '700' }
});