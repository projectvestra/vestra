import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { listenToAuthState } from '../src/services/authService';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';
import type { User } from 'firebase/auth';
import { isOnboardingCompleted } from '../src/services/userPreferencesService';
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAuthState((authUser: User | null) => {
  console.log("AUTH STATE CHANGED:", authUser);
  setUser(authUser);
  setLoading(false);
});

    return unsubscribe;
  }, []);


  useEffect(() => {
  const checkNavigation = async () => {
    if (loading) return;

    const onboardingDone = await isOnboardingCompleted();

    console.log("USER:", user);
    console.log("ONBOARDING:", onboardingDone);

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (!onboardingDone) {
      router.replace('/onboarding/step1');
      return;
    }

    router.replace('/tabs/home');
  };

  checkNavigation();
}, [user, loading]);

//   useEffect(() => {
   
//   const checkNavigation = async () => {
//      if (loading) return;


//      // Wait for router segments to be ready
//     if (!segments?.[0]) return;

//     const inAuthGroup = segments[0] === 'auth';
//     const inOnboarding = segments[0] === 'onboarding';

//     console.log("NAV CHECK");
//     console.log("USER:", user);
//     console.log("SEGMENTS:", segments);

//     /* ----------------------------
//        USER NOT LOGGED IN
//     ----------------------------- */
//     if (!user) {
//       if (!inAuthGroup) {
//         console.log("→ Redirect login");
//         router.replace('/auth/login');
//       }
//       return;
//     }

//     /* ----------------------------
//        USER LOGGED IN
//     ----------------------------- */

//     const onboardingDone = await isOnboardingCompleted();

//     if (!onboardingDone) {
//       if (!inOnboarding) {
//         console.log("→ Redirect onboarding");
//         router.replace('/onboarding/step1');
//       }
//       return;
//     }

//     /* ----------------------------
//        USER READY → HOME
//     ----------------------------- */

//     if (inAuthGroup || inOnboarding) {
//       console.log("→ Redirect onboarding");
//       router.replace('/tabs/home');
//     }
//   };

//   checkNavigation();
// }, [user, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.light.background,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}