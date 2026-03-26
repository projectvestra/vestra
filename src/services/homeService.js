import { getUserWardrobeItems } from './cloudWardrobeService';
import { generateOutfit } from "./outfitService";
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
   Weekly Preview (Mock)
------------------------------------------ */
export async function getWeeklyPreview() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, index) => ({
    day,
    tag: index % 2 === 0 ? 'Casual' : 'Smart',
  }));
}