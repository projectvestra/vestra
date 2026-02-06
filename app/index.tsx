import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { isOnboardingComplete } from '../src/services/appStateService';

export default function AppEntry() {
  const onboardingDone = isOnboardingComplete();

  if (onboardingDone) {
    return <Redirect href="/tabs/home" />;
  }

  return <Redirect href="/auth/login" />;
}
