import { db, auth } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'vestra_wardrobe_cache';

const CLOUD_NAME = "dg4czydbm";
const UPLOAD_PRESET = "vestra_upload";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/* ------------------------------------------
   Upload Image
------------------------------------------ */
export async function uploadWardrobeImage(uri) {
  const formData = new FormData();

  if (uri.startsWith('blob:') || uri.startsWith('data:')) {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('file', blob, 'upload.jpg');
  } else {
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
  }

  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Image upload failed');
  }

  return data.secure_url;
}

/* ------------------------------------------
   Create Item
------------------------------------------ */
export async function createWardrobeItem(item) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, 'wardrobe_items'), {
    userId: user.uid,
    imageUrl: item.imageUrl,
    clothingType: item.category,
    detectedColor: item.colorName || 'Unknown',
    colorHex: item.colorHex || '#808080',
    size: item.size || null,
    fit: item.fit || null,
    brand: null,
    createdAt: serverTimestamp(),
  });

  // Clear cache so wardrobe reloads fresh
  await AsyncStorage.removeItem(CACHE_KEY);
  return docRef.id;
}

/* ------------------------------------------
   Update Item
------------------------------------------ */
export async function updateWardrobeItem(itemId, updates) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const ref = doc(db, 'wardrobe_items', itemId);
  await updateDoc(ref, {
    clothingType: updates.category,
    size: updates.size || null,
    fit: updates.fit || null,
    detectedColor: updates.colorName || 'Unknown',
    colorHex: updates.colorHex || '#808080',
  });

  // Clear cache
  await AsyncStorage.removeItem(CACHE_KEY);
}

/* ------------------------------------------
   Delete Item
------------------------------------------ */
export async function deleteWardrobeItemCloud(itemId) {
  await deleteDoc(doc(db, 'wardrobe_items', itemId));
  await AsyncStorage.removeItem(CACHE_KEY);
}

/* ------------------------------------------
   Fetch Items
------------------------------------------ */
export async function getUserWardrobeItems() {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const q = query(
      collection(db, 'wardrobe_items'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);

    const items = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        image: data.imageUrl,
        name: data.clothingType,
        category: data.clothingType,
        color: data.colorHex,
        colorName: data.detectedColor,
        size: data.size,
        fit: data.fit,
      };
    });

    const result = { totalCount: items.length, items };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));
    return result;

  } catch (error) {
    console.log('Firestore failed, using cache:', error.message);
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
    throw error;
  }
}