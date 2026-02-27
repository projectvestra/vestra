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

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

// Required for auth-session
WebBrowser.maybeCompleteAuthSession();

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
   Google Login (Expo Compatible)
--------------------------------------------- */

export function useGoogleAuthRequest() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  return { request, response, promptAsync };
}

export async function loginWithGoogle(idToken) {
  try {
    const credential = GoogleAuthProvider.credential(idToken);

    const result = await signInWithCredential(auth, credential);

    return {
      success: true,
      message: 'Google login successful',
      user: result.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/* ---------------------------------------------
   Logout
--------------------------------------------- */
export async function logout() {
  try {
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