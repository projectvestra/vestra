// src/services/authService.js

import Constants from 'expo-constants';
import { auth, db } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

const expoExtra = Constants.expoConfig?.extra || {};
const googleWebClientId = expoExtra.firebase?.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/* ---------------------------------------------
   Configure Google Sign-In (Native)
--------------------------------------------- */

GoogleSignin.configure({
  webClientId: googleWebClientId,
});

/* ---------------------------------------------
   Check if Username is Unique
--------------------------------------------- */
export async function isUsernameUnique(username) {
  try {
    if (!username) return false;
    const userProfiles = collection(db, 'user_profiles');
    const q = query(userProfiles, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username uniqueness:', error.message);
    return false;
  }
}

/* ---------------------------------------------
   Email Register (New Users - Email Only)
--------------------------------------------- */
export async function registerWithEmail(name, email, password) {
  try {
    if (!email || !password) {
      return { success: false, message: 'Email and password required.' };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, {
      displayName: name,
    });

    // Create user profile in Firestore (username will be set later)
    await setDoc(doc(db, 'user_profiles', userCredential.user.uid), {
      displayName: name,
      email: email,
      username: null,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Registration successful',
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/* ---------------------------------------------
   Login with Email (New & Existing Users)
--------------------------------------------- */
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      message: 'Login successful',
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/* ---------------------------------------------
   Login with Username (Existing Users Only)
--------------------------------------------- */
export async function loginWithUsername(username, password) {
  try {
    if (!username || !password) {
      return { success: false, message: 'Username and password required.' };
    }

    // Find user by username in Firestore
    const userProfiles = collection(db, 'user_profiles');
    const q = query(userProfiles, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'Username not found.' };
    }

    const userProfile = querySnapshot.docs[0].data();
    const email = userProfile.email;

    if (!email) {
      return { success: false, message: 'Email not associated with this username.' };
    }

    // Login using the email associated with the username
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    return {
      success: true,
      message: 'Login successful',
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/* ---------------------------------------------
   Native Google Login (Android Production Safe)
--------------------------------------------- */
export async function loginWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const userInfo = await GoogleSignin.signIn();

    console.log("USER INFO:", userInfo);

    const idToken = userInfo.data?.idToken;

    console.log("ID TOKEN:", idToken);

    if (!idToken) {
      return {
        success: false,
        message: 'Google idToken not received.',
      };
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);

    const result = await signInWithCredential(auth, googleCredential);

    return {
      success: true,
      message: 'Google login successful',
      user: result.user,
    };
  } catch (error) {
    console.log('GOOGLE LOGIN ERROR:', error);
    return {
      success: false,
      message: error.message || 'Google authentication failed.',
    };
  }
}

/* ---------------------------------------------
   Logout
--------------------------------------------- */
export async function logout() {
  try {
    await GoogleSignin.signOut(); // native signout
    await signOut(auth);

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/* ---------------------------------------------
   Get Current User
--------------------------------------------- */
export function getCurrentUser() {
  return auth.currentUser;
}

/* ---------------------------------------------
   Auth State Listener
--------------------------------------------- */
export function listenToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}