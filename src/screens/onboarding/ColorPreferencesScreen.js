import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';

export default function ColorPreferencesScreen() {
  const router = useRouter();
  const { updatePreferences } = useOnboarding();
  const { theme } = useTheme();

  const [selectedColors, setSelectedColors] = useState([]);

  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Green", hex: "#008000" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Red", hex: "#FF0000" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Purple", hex: "#800080" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Gray", hex: "#808080" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Navy", hex: "#000080" },
    { name: "Burgundy", hex: "#800020" },
    { name: "Teal", hex: "#008080" },
    { name: "Cream", hex: "#FFFDD0" }
  ];

  const toggleColor = (colorName) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter(c => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  const handleContinue = () => {
    updatePreferences({ preferredColors: selectedColors });
    router.push('/onboarding/step4');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.progress, { color: theme.text3 }]}>Step 3 of 4</Text>

        <Text style={[styles.title, { color: theme.text }]}>Pick your colors</Text>
        <Text style={[styles.subtitle, { color: theme.text2 }]}>
          Choose the colors you usually wear.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Color Preferences</Text>
        <View style={styles.colorsContainer}>
          {colors.map(color => (
            <TouchableOpacity
              key={color.name}
              style={[
                styles.colorOption,
                { borderColor: theme.border, backgroundColor: theme.card },
                selectedColors.includes(color.name) && [styles.selected, { backgroundColor: theme.tint }]
              ]}
              onPress={() => toggleColor(color.name)}
            >
              <View style={[styles.colorCircle, { backgroundColor: color.hex }]} />
              <Text style={[
                styles.colorText,
                { color: theme.text },
                selectedColors.includes(color.name) && { color: theme.bg }
              ]}>
                {color.name}
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
  colorsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 },
  colorOption: { width: '30%', borderWidth: 1, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16, position: 'relative' },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  colorCircle: { width: 30, height: 30, borderRadius: 15, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
  colorText: { fontSize: 14, fontWeight: '500' },
  button: { paddingVertical: 16, borderRadius: 12, marginTop: 12 },
  buttonText: { textAlign: 'center', fontSize: 16, fontWeight: '500' }
});