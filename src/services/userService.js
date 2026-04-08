import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const snap = await getDoc(doc(db, 'user_profiles', user.uid));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (e) {
    console.log('getUserProfile error:', e);
    return null;
  }
}

export async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    await setDoc(doc(db, 'user_profiles', user.uid), data, { merge: true });
    return true;
  } catch (e) {
    console.log('updateUserProfile error:', e);
    return false;
  }
}

export async function createUserProfile(preferences) {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    await setDoc(doc(db, 'user_profiles', user.uid), preferences, { merge: true });
    return true;
  } catch (e) {
    console.log('createUserProfile error:', e);
    return false;
  }
}