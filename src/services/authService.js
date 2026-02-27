// src/services/authService.js

import { auth } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

/* ---------------------------------------------
   Configure Google Sign-In (Native)
--------------------------------------------- */

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

/* ---------------------------------------------
   Email Register
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
   Email Login
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