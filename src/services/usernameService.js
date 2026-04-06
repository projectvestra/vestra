import { auth, db } from './firebaseConfig';
import {
  doc, getDoc, setDoc, deleteDoc,
  runTransaction, collection, query, where, getDocs, updateDoc
} from 'firebase/firestore';

export async function isUsernameTaken(username) {
  if (!username || username.length < 3) return false;
  const clean = username.toLowerCase().trim();
  const ref = doc(db, 'usernames', clean);
  const snap = await getDoc(ref);
  return snap.exists();
}

/**
 * @param {string} userId
 * @param {string} newUsername
 * @param {string|null} [oldUsername]
 */
export async function claimUsername(userId, newUsername, oldUsername = null) {
  const clean = newUsername.toLowerCase().trim();

  if (clean.length < 3) throw new Error('Username must be at least 3 characters');
  if (!/^[a-z0-9_]+$/.test(clean)) throw new Error('Username can only contain letters, numbers, and underscores');

  await runTransaction(db, async (transaction) => {
    const newRef = doc(db, 'usernames', clean);
    const newSnap = await transaction.get(newRef);

    if (newSnap.exists() && newSnap.data().userId !== userId) {
      throw new Error('Username already taken');
    }

    // Release old username
    if (oldUsername) {
      const oldRef = doc(db, 'usernames', oldUsername.toLowerCase().trim());
      transaction.delete(oldRef);
    }

    // Claim new username
    transaction.set(newRef, { userId, username: clean, claimedAt: new Date().toISOString() });
    
    // Update user profile with username
    const userProfileRef = doc(db, 'user_profiles', userId);
    transaction.update(userProfileRef, {
      username: clean,
      updatedAt: new Date().toISOString(),
    });
  });

  return true;
}

/* ------------------------------------------
   Get Current User's Profile
------------------------------------------ */
export async function getUserProfile() {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, message: 'User not authenticated.' };
    }

    const docSnap = await getDoc(doc(db, 'user_profiles', user.uid));
    if (docSnap.exists()) {
      return {
        success: true,
        profile: docSnap.data(),
      };
    }

    return { success: false, message: 'User profile not found.' };
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}