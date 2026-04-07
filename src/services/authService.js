import Constants from 'expo-constants';
import { auth, db } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const expoExtra = Constants.expoConfig?.extra || {};
const googleWebClientId =
  expoExtra.firebase?.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

GoogleSignin.configure({
  webClientId: googleWebClientId,
  offlineAccess: true,
});

function sanitizeUsername(username) {
  return (username || '').toLowerCase().trim();
}

function deriveDisplayNameFromEmail(email) {
  if (!email) return 'User';
  const localPart = email.split('@')[0] || 'user';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

async function syncProfileFromUser(user) {
  if (!user) return;

  const profileRef = doc(db, 'user_profiles', user.uid);
  const profileSnap = await getDoc(profileRef);

  const displayName = user.displayName || deriveDisplayNameFromEmail(user.email || '');
  const patch = {
    email: user.email || '',
    displayName,
    updatedAt: new Date().toISOString(),
  };

  if (!profileSnap.exists()) {
    await setDoc(profileRef, {
      ...patch,
      username: null,
      createdAt: new Date().toISOString(),
    });
    return;
  }

  const existing = profileSnap.data() || {};
  const mergePatch = {};

  if (!existing.email && patch.email) mergePatch.email = patch.email;
  if (!existing.displayName && patch.displayName) mergePatch.displayName = patch.displayName;
  if (Object.keys(mergePatch).length > 0) {
    await setDoc(profileRef, { ...mergePatch, updatedAt: patch.updatedAt }, { merge: true });
  }
}

export async function isUsernameUnique(username) {
  try {
    const cleanUsername = sanitizeUsername(username);
    if (!cleanUsername) return false;

    const userProfiles = collection(db, 'user_profiles');
    const q = query(userProfiles, where('username', '==', cleanUsername));
    const querySnapshot = await getDocs(q);

    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username uniqueness:', error.message);
    return false;
  }
}

export async function registerWithEmail(name, email, password, username) {
  try {
    const cleanUsername = sanitizeUsername(username);

    if (!name || !email || !password || !cleanUsername) {
      return {
        success: false,
        message: 'Username, display name, email, and password are required.',
      };
    }

    if (cleanUsername.length < 3 || !/^[a-z0-9_]+$/.test(cleanUsername)) {
      return {
        success: false,
        message:
          'Username must be at least 3 characters and can only use letters, numbers, and underscores.',
      };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: name,
    });

    try {
      await runTransaction(db, async (transaction) => {
        const usernameRef = doc(db, 'usernames', cleanUsername);
        const usernameSnap = await transaction.get(usernameRef);

        if (usernameSnap.exists() && usernameSnap.data().userId !== userCredential.user.uid) {
          throw new Error('This username is already taken.');
        }

        transaction.set(usernameRef, {
          userId: userCredential.user.uid,
          username: cleanUsername,
          claimedAt: new Date().toISOString(),
        });

        const profileRef = doc(db, 'user_profiles', userCredential.user.uid);
        transaction.set(profileRef, {
          displayName: name,
          email,
          username: cleanUsername,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (txError) {
      await deleteUser(userCredential.user);
      throw txError;
    }

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

export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await syncProfileFromUser(userCredential.user);

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

export async function loginWithEmailOrUsername(identifier, password) {
  const cleanIdentifier = (identifier || '').trim();

  if (!cleanIdentifier || !password) {
    return {
      success: false,
      message: 'Email or username and password are required.',
    };
  }

  if (cleanIdentifier.includes('@')) {
    return loginWithEmail(cleanIdentifier, password);
  }

  return loginWithUsername(cleanIdentifier, password);
}

export async function loginWithUsername(username, password) {
  try {
    const cleanUsername = sanitizeUsername(username);

    if (!cleanUsername || !password) {
      return { success: false, message: 'Username and password required.' };
    }

    const userProfiles = collection(db, 'user_profiles');
    const q = query(userProfiles, where('username', '==', cleanUsername));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'Username not found.' };
    }

    const userProfile = querySnapshot.docs[0].data();
    const userEmail = userProfile.email;

    if (!userEmail) {
      return { success: false, message: 'Email not associated with this username.' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
    await syncProfileFromUser(userCredential.user);

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

export async function loginWithGoogle() {
  try {
    if (!googleWebClientId) {
      return {
        success: false,
        message: 'Google Sign-In is not configured. Missing web client ID.',
      };
    }

    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens().catch(() => null);
    const idToken = userInfo?.data?.idToken || userInfo?.idToken || tokens?.idToken;

    if (!idToken) {
      return {
        success: false,
        message: 'Google idToken not received.',
      };
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, googleCredential);

    const user = result.user;
    await syncProfileFromUser(user);
    const profileRef = doc(db, 'user_profiles', user.uid);
    const refreshedProfile = await getDoc(profileRef);
    const hasUsername = Boolean(refreshedProfile.data()?.username);

    return {
      success: true,
      message: 'Google login successful',
      user,
      requiresUsername: !hasUsername,
    };
  } catch (error) {
    console.log('GOOGLE LOGIN ERROR:', error);
    return {
      success: false,
      message: error.message || 'Google authentication failed.',
    };
  }
}

export async function logout() {
  try {
    await GoogleSignin.signOut();
    await signOut(auth);

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function listenToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getProfileCompletionStatus(uid) {
  try {
    if (!uid) return { hasUsername: false };

    const profileSnap = await getDoc(doc(db, 'user_profiles', uid));

    if (!profileSnap.exists()) {
      return { hasUsername: false };
    }

    const data = profileSnap.data() || {};
    return {
      hasUsername: Boolean(data.username),
    };
  } catch {
    return { hasUsername: false };
  }
}
