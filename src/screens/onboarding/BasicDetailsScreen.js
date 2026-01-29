import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function BasicDetailsScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Onboarding – Basic Details</Text>
      <Button title="Next" onPress={() => router.push('/onboarding/step2')} />
    </View>
  );
}
