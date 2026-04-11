import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { ui } from '../../theme/ui';

export default function BasicDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={[styles.contentCard, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, justifyContent: 'center', minHeight: '100%' },
  contentCard: {
    borderWidth: 1,
    borderRadius: ui.radius.xl,
    padding: 18,
    ...ui.shadow.elevated,
  },
  progress: { fontSize: 12, textAlign: 'center', marginBottom: 12, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderRadius: ui.radius.md,
    padding: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  bodyTypesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 },
  bodyTypeOption: {
    borderWidth: 1,
    borderRadius: ui.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  bodyTypeText: { fontSize: 13, fontWeight: '600' },
  button: { paddingVertical: 16, borderRadius: ui.radius.md, marginTop: 4 },
  buttonText: { textAlign: 'center', fontSize: 15, fontWeight: '700' }
});