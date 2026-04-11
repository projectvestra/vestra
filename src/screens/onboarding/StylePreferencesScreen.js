import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { ui } from '../../theme/ui';

export default function StylePreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={[styles.contentCard, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
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
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  stylesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 },
  styleOption: {
    borderWidth: 1,
    borderRadius: ui.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  styleText: { fontSize: 13, fontWeight: '600' },
  button: { paddingVertical: 16, borderRadius: ui.radius.md, marginTop: 4 },
  buttonText: { textAlign: 'center', fontSize: 15, fontWeight: '700' }
});