// import AsyncStorage from '@react-native-async-storage/async-storage';

// const PREFERENCES_KEY = 'vestra_user_preferences';
// const ONBOARDING_KEY = 'vestra_onboarding_completed';

// /* ------------------------------------------
//    Save onboarding preferences
// ------------------------------------------ */
// export async function savePreferences(preferences) {
//   try {
//     await AsyncStorage.setItem(
//       PREFERENCES_KEY,
//       JSON.stringify(preferences)
//     );

//     return { success: true };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// }

// /* ------------------------------------------
//    Get saved preferences
// ------------------------------------------ */
// export async function getPreferences() {
//   try {
//     const data = await AsyncStorage.getItem(PREFERENCES_KEY);

//     if (!data) return null;

//     return JSON.parse(data);
//   } catch (error) {
//     return null;
//   }
// }

// /* ------------------------------------------
//    Mark onboarding as complete
// ------------------------------------------ */
// export async function setOnboardingCompleted() {
//   try {
//     await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
//   } catch (error) {
//     console.log('Onboarding save error', error);
//   }
// }

// /* ------------------------------------------
//    Check onboarding status
// ------------------------------------------ */
// export async function isOnboardingCompleted() {
//   try {
//     const value = await AsyncStorage.getItem(ONBOARDING_KEY);
//     return value === 'true';
//   } catch {
//     return false;
//   }
// }
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ONBOARDING_KEY = 'vestra_onboarding_completed';

/* ------------------------------------------
   (OPTIONAL) Cache Preferences Locally
------------------------------------------ */
export async function cachePreferences(preferences) {
  try {
    await AsyncStorage.setItem(
      'vestra_user_preferences_cache',
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.log('Cache error', error);
  }
}

/* ------------------------------------------
   (OPTIONAL) Get Cached Preferences
------------------------------------------ */
export async function getCachedPreferences() {
  try {
    const data = await AsyncStorage.getItem(
      'vestra_user_preferences_cache'
    );

    if (!data) return null;

    return JSON.parse(data);
  } catch {
    return null;
  }
}

/* ------------------------------------------
   Mark onboarding as complete
------------------------------------------ */
export async function setOnboardingCompleted() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.log('Onboarding save error', error);
  }
}

/* ------------------------------------------
   Check onboarding status
------------------------------------------ */
export async function isOnboardingCompleted() {
  try {
    const user = auth.currentUser;
    if (user) {
      const profileSnap = await getDoc(doc(db, 'user_profiles', user.uid));
      if (profileSnap.exists()) {
        return true;
      }
    }

    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}