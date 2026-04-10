import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';

const expoExtra = Constants.expoConfig?.extra || {};
const firebaseExtra = expoExtra.firebase || {};

const firebaseConfig = {
  apiKey: firebaseExtra.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: firebaseExtra.authDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseExtra.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: firebaseExtra.storageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseExtra.messagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseExtra.appId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required Firebase config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration:', missingKeys);
  throw new Error(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`);
}

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

let auth: Auth;
if (Platform.OS === 'web') {
  try {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } catch {
    auth = getAuth(app);
  }
} else {
  // Use AsyncStorage for persistence on native platforms (iOS/Android)
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
export { auth, db };