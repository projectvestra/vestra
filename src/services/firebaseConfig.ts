import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  type Auth
} from "firebase/auth";
import {
  getFirestore
} from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";
import Constants from "expo-constants";

const firebaseExtra = Constants.expoConfig?.extra?.firebase;

const firebaseConfig = {
  apiKey: firebaseExtra?.apiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: firebaseExtra?.authDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseExtra?.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: firebaseExtra?.storageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseExtra?.messagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseExtra?.appId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}
const db = getFirestore(app);
export { auth ,db};