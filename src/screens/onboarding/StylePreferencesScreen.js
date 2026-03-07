import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

export default function StylePreferencesScreen() {
  const router = useRouter();
  const { updatePreferences } = useOnboarding();

  const [selectedStyles, setSelectedStyles] = useState([]);

  const stylesList = ["Casual", "Formal", "Sporty", "Streetwear"];

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
    <View style={styles.container}>
      <Text style={styles.progress}>Step 2 of 4</Text>

      <Text style={styles.title}>Choose your style</Text>
      <Text style={styles.subtitle}>
        Select the styles you usually prefer.
      </Text>

      <View style={styles.optionsContainer}>
        {stylesList.map(style => (
          <TouchableOpacity
            key={style}
            style={[
              styles.option,
              selectedStyles.includes(style) && styles.selected
            ]}
            onPress={() => toggleStyle(style)}
          >
            <Text style={styles.optionText}>{style}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:24,justifyContent:'center',backgroundColor:'#fff'},
  progress:{fontSize:14,color:'#888',textAlign:'center',marginBottom:12},
  title:{fontSize:26,fontWeight:'600',textAlign:'center',color:'#111',marginBottom:8},
  subtitle:{fontSize:15,textAlign:'center',color:'#666',marginBottom:28},
  optionsContainer:{marginBottom:32},
  option:{
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:10,
    paddingVertical:16,
    alignItems:'center',
    marginBottom:12
  },
  selected:{
    backgroundColor:'#000',
    borderColor:'#000'
  },
  optionText:{fontSize:16,color:'#111'},
  actions:{flexDirection:'row',justifyContent:'space-between'},
  secondaryButton:{paddingVertical:14,paddingHorizontal:24},
  secondaryButtonText:{fontSize:15,color:'#555'},
  primaryButton:{backgroundColor:'#000',paddingVertical:14,paddingHorizontal:28,borderRadius:10},
  primaryButtonText:{color:'#fff',fontSize:15,fontWeight:'500'}
});