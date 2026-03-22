import { db } from './firebaseConfig';
import { auth } from './firebaseConfig';

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// 🔥 CHANGE THESE
const CLOUD_NAME = "dzoy9fmv8";
const UPLOAD_PRESET = "vestra_upload";

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/* ------------------------------------------
   Upload Image to Cloudinary
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
   Create Firestore Item
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
   Fetch User Items
------------------------------------------ */
export async function getUserWardrobeItems() {
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'wardrobe_items'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  const items = snapshot.docs.map(doc => {
    // id: doc.id,
    // ...doc.data(),
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

  return {
    totalCount: items.length,
    items,
  };
}