import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ColorPreferencesScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Onboarding – Color Preferences</Text>
      <Button title="Back" onPress={() => router.back()} />
      <Button title="Next" onPress={() => router.push('/onboarding/step4')} />
    </View>
  );
}
