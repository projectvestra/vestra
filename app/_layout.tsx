import { Stack, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { listenToAuthState, getProfileCompletionStatus } from '../src/services/authService';
import { View, ActivityIndicator } from 'react-native';
import type { User } from 'firebase/auth';
import { isOnboardingCompleted } from '../src/services/userPreferencesService';
import { OnboardingProvider } from '../src/context/OnboardingContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const unsubscribe = listenToAuthState((authUser: User | null) => {
      setUser(authUser);
      setLoading(false);
      hasNavigated.current = false;
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkNavigation = async () => {
      if (loading) return;
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      if (!user) {
        router.replace('/auth/login');
        return;
      }

      try {
        const completion = await getProfileCompletionStatus(user.uid);
        if (!completion.hasUsername) {
          router.replace('/auth/complete-profile');
          return;
        }

        const onboardingDone = await isOnboardingCompleted();
        if (!onboardingDone) {
          router.replace('/onboarding/step1');
        } else {
          router.replace('/tabs/home');
        }
      } catch (error) {
        console.log('Onboarding check error:', error);
        router.replace('/tabs/home');
      }
    };

    checkNavigation();
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <OnboardingProvider>
        <AppStatusBar />
        <Stack screenOptions={{ headerShown: false }} />
      </OnboardingProvider>
    </ThemeProvider>
  );
}

function AppStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}