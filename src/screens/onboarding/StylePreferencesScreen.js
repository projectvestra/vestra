import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';

export default function StylePreferencesScreen() {
  const router = useRouter();
  const { updatePreferences } = useOnboarding();
  const { theme } = useTheme();

  const [selectedStyles, setSelectedStyles] = useState([]);

  const stylesList = [
    "Casual", "Formal", "Sporty", "Streetwear",
    "Bohemian", "Minimalist", "Vintage", "Preppy",
    "Gothic", "Retro", "Chic", "Eclectic"
  ];

  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleContinue = () => {
    updatePreferences({ styles: selectedStyles });
    router.push('/onboarding/step3');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.progress, { color: theme.text3 }]}>Step 2 of 4</Text>

        <Text style={[styles.title, { color: theme.text }]}>Choose your style</Text>
        <Text style={[styles.subtitle, { color: theme.text2 }]}>
          Select the styles you usually prefer.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Style Preferences</Text>
        <View style={styles.stylesContainer}>
          {stylesList.map(style => (
            <TouchableOpacity
              key={style}
              style={[
                styles.styleOption,
                { borderColor: theme.border, backgroundColor: theme.card },
                selectedStyles.includes(style) && [styles.selected, { backgroundColor: theme.tint }]
              ]}
              onPress={() => toggleStyle(style)}
            >
              <Text style={[
                styles.styleText,
                { color: theme.text },
                selectedStyles.includes(style) && { color: theme.bg }
              ]}>
                {style}
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
  sectionTitle: { fontSize: 18, fontWeight: '500', marginBottom: 16 },
  stylesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 },
  styleOption: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 12,
  },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  styleText: { fontSize: 16 },
  button: { paddingVertical: 16, borderRadius: 12, marginTop: 12 },
  buttonText: { textAlign: 'center', fontSize: 16, fontWeight: '500' }
});