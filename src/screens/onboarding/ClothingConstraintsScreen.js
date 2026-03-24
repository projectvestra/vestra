import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  setOnboardingCompleted,
} from '../../services/userPreferencesService';
import { createUserProfile } from '../../services/userService';
export default function ClothingConstraintsScreen() {
  const router = useRouter();
  const { preferences, updatePreferences } = useOnboarding();

  const [selectedConstraints, setSelectedConstraints] = useState([]);

  const constraintsList = [
    "No Sleeveless",
    "Loose Fit",
    "Formal Wear Only",
    "No Leather"
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
    <View style={styles.container}>
      <Text style={styles.progress}>Step 4 of 4</Text>

      <Text style={styles.title}>Any clothing preferences?</Text>
      <Text style={styles.subtitle}>
        Let us know if you avoid or prefer certain clothing.
      </Text>

      <View style={styles.optionsContainer}>
        {constraintsList.map((constraint) => (
          <TouchableOpacity
            key={constraint}
            style={[
              styles.option,
              selectedConstraints.includes(constraint) && styles.selected
            ]}
            onPress={() => toggleConstraint(constraint)}
          >
            <Text style={styles.optionText}>{constraint}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.finishButton}
        onPress={handleFinish}
      >
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
  selected: {
    backgroundColor: '#000',
    borderColor: '#000'
  },
  optionText: {
    fontSize: 16,
    color: '#111',
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