import { db, auth } from './firebaseConfig';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

/* ------------------------------------------
   Create User Profile (after onboarding)
------------------------------------------ */
export async function createUserProfile(preferences) {
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, 'users', user.uid);

  await setDoc(userRef, {
    userId: user.uid,
    name: user.displayName || 'User',
    email: user.email || '',

    // onboarding data
    styles: preferences.styles || [],
    preferredColors: preferences.preferredColors || [],
    bodyType: preferences.bodyType || '',
    height: preferences.height || null,
    constraints: preferences.constraints || [],

    createdAt: serverTimestamp(),
  });

  return true;
}

/* ------------------------------------------
   Get User Profile
------------------------------------------ */
export async function getUserProfile() {
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return snapshot.data();
}

/* ------------------------------------------
   Update Preferences
------------------------------------------ */
export async function updateUserPreferences(updates) {
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, 'users', user.uid);

  await updateDoc(userRef, updates);
}