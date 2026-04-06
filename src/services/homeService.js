import { getUserWardrobeItems } from './cloudWardrobeService';
import { generateOutfit } from "./outfitService";
import { db, auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
/* ------------------------------------------
   Home Summary
------------------------------------------ */

export async function getHomeSummary() {
  try {
    const data = await getUserWardrobeItems();
    const items = data.items;

    return {
      totalItems: items.length,
      recentItem: items.length > 0 ? items[0] : null,
    };
  } catch (error) {
    console.log("Home summary error:", error);
    return {
      totalItems: 0,
      recentItem: null,
    };
  }
}

/* ------------------------------------------
   Today Outfit
------------------------------------------ */
// export async function getTodayOutfit() {
//   const data = await getUserWardrobeItems();
//   const items = data.items;

//   const shirt = items.find(i => i.category === 'Shirts');
//   const pants = items.find(i => i.category === 'Pants');
//   const shoes = items.find(i => i.category === 'Shoes');

//   return {
//     shirt: shirt || null,
//     pants: pants || null,
//     shoes: shoes || null,
//     explanation:
//       "Balanced tones from your wardrobe create a clean and versatile look for today.",
//   };
// }

export async function getTodayOutfit() {
  const outfit = await generateOutfit();

  return outfit || {
    shirt: null,
    pants: null,
    shoes: null,
    explanation: "No outfit could be generated yet.",
  };
}

/* ------------------------------------------
   Weekly Preview
------------------------------------------ */
export async function getWeeklyPreview() {
  const user = auth.currentUser;
  if (!user) return { weeklyData: [], planData: {} };

  try {
    const snap = await getDoc(doc(db, 'weekly_plans', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      const occasions = data.occasions || {};
      const plan = data.plan || {};

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      const weeklyData = days.map((day, idx) => ({
        day,
        tag: occasions[fullDays[idx]] || 'casual',
      }));

      return { weeklyData, planData: plan };
    }
  } catch (e) {
    console.log('Weekly preview error:', e);
  }

  // Fallback to mock
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    weeklyData: days.map((day, index) => ({
      day,
      tag: index % 2 === 0 ? 'casual' : 'smart-casual',
    })),
    planData: {}
  };
}