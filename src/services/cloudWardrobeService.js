import { db, auth } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'vestra_wardrobe_cache';
/* ------------------------------------------
   Cloudinary Config
------------------------------------------ */
const CLOUD_NAME = "dzoy9fmv8";
const UPLOAD_PRESET = "vestra_upload";

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/* ------------------------------------------
   Upload Image
------------------------------------------ */
export async function uploadWardrobeImage(uri) {
  const formData = new FormData();

  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });

  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Image upload failed');
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
    detectedColor: item.colorName,
    colorHex: item.colorHex,
    size: item.size || null,
    fit: item.fit || null,
    brand: null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/* ------------------------------------------
   Delete Item
------------------------------------------ */
export async function deleteWardrobeItemCloud(itemId) {
  try {
    console.log("Deleting item ID:", itemId);
    await deleteDoc(doc(db, 'wardrobe_items', itemId));
  } catch (error) {
    console.log("Delete error:", error);
    throw error;
  }
}

/* ------------------------------------------
   Fetch Items
------------------------------------------ */
export async function getUserWardrobeItems() {
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  try {
    // 🔹 1. Try cache first
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      console.log("Loaded from cache");
    }

    // 🔹 2. Fetch from Firestore
    const q = query(
      collection(db, 'wardrobe_items'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    const items = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        image: data.imageUrl,
        name: data.clothingType,
        category: data.clothingType,
        color: data.colorHex,
        size: data.size,
        fit: data.fit,
      };
    });

    const result = {
      totalCount: items.length,
      items,
    };

    // 🔹 3. Update cache
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));

    return result;

  } catch (error) {
    console.log("Firestore failed, using cache");

    // 🔹 4. Fallback to cache
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    throw error;
  }
}