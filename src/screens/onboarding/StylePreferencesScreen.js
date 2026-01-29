import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function StylePreferencesScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Onboarding – Style Preferences</Text>
      <Button title="Back" onPress={() => router.back()} />
      <Button title="Next" onPress={() => router.push('/onboarding/step3')} />
    </View>
  );
}
