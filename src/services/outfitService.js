import { getUserWardrobeItems } from "./cloudWardrobeService";
import { getUserProfile } from "./userService";

/* ------------------------------------------
   Normalize Text
------------------------------------------ */
function normalize(value) {
  return value?.toLowerCase().trim();
}

/* ------------------------------------------
   Flexible Category Matching
------------------------------------------ */
function isShirt(type) {
  const t = normalize(type);
  return t?.includes("shirt") || t?.includes("t-shirt") || t?.includes("top");
}

function isPant(type) {
  const t = normalize(type);
  return (
    t?.includes("pant") ||
    t?.includes("jean") ||
    t?.includes("trouser")
  );
}

function isShoe(type) {
  const t = normalize(type);
  return t?.includes("shoe") || t?.includes("sneaker");
}

function isAccessory(type) {
  const t = normalize(type);
  return (
    t?.includes("accessory") ||
    t?.includes("watch") ||
    t?.includes("cap") ||
    t?.includes("belt")
  );
}
/* ------------------------------------------
   Color Compatibility
------------------------------------------ */
function isColorCompatible(color1, color2) {
  if (!color1 || !color2) return true;

  if (color1 === color2) return true;

  const neutralColors = ["black", "white", "grey", "beige"];
  if (
    neutralColors.includes(normalize(color1)) ||
    neutralColors.includes(normalize(color2))
  ) {
    return true;
  }

  return false;
}

/* ------------------------------------------
   Pick Random Item (better UX)
------------------------------------------ */
function pickRandom(items) {
  if (!items || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

/* ------------------------------------------
   Generate Outfit
------------------------------------------ */
export async function generateOutfit() {
  try {
    const wardrobeData = await getUserWardrobeItems();
    const userProfile = await getUserProfile();

    const items = wardrobeData?.items || [];

    if (items.length === 0) return null;

    const preferredColors = userProfile?.preferredColors || [];
    const styles = userProfile?.styles || [];

    const shirts = items.filter(i => isShirt(i.category));
    const pants = items.filter(i => isPant(i.category));
    const shoes = items.filter(i => isShoe(i.category));
    const accessories = items.filter(i => isAccessory(i.category));

    if (!shirts.length || !pants.length || !shoes.length) {
      return null;
    }

    // 🔥 prioritize preferred colors
    const shirtPool = shirts.filter(s =>
      preferredColors.some(c =>
      s.color?.toLowerCase().includes(c.toLowerCase())
)
    );

    const selectedShirt =
      shirtPool.length > 0
        ? pickRandom(shirtPool)
        : pickRandom(shirts);

    // match pants with shirt
    const selectedPants =
      pants.find(p =>
        isColorCompatible(selectedShirt.color, p.color)
      ) || pickRandom(pants);

    // match shoes with pants
    const selectedShoes =
      shoes.find(s =>
        isColorCompatible(selectedPants.color, s.color)
      ) || pickRandom(shoes);

      const selectedAccessory =
  accessories.length > 0 ? pickRandom(accessories) : null;

    return {
      shirt: selectedShirt,
      pants: selectedPants,
      shoes: selectedShoes,
      accessory: selectedAccessory, 
      explanation: `Outfit generated based on your preferred colors and wardrobe.`,
    };

  } catch (error) {
    console.log("Outfit generation error:", error);
    return null;
  }
}