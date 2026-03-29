import { View, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { useRef } from 'react';
import { getTemplate } from '../utils/templateMap';

/* ------------------------------------------
   Render Order (Scalable)
------------------------------------------ */
const ORDER = ['shirt', 'pants', 'shoes', 'accessory'];

/* ------------------------------------------
   Individual Item Component
------------------------------------------ */
function OutfitItem({ item, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  if (!item) return null;

  const template = getTemplate(item.category, item.subtype);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.08,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.itemContainer,
          { transform: [{ scale }] },
        ]}
      >
        <Image
          source={template}
          style={[
            styles.image,
            { tintColor: item.color || '#ccc' },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------
   Main Outfit Preview
------------------------------------------ */
export default function OutfitPreview({ outfit, onItemPress }) {
  if (!outfit) return null;
  console.log("outfit data:", outfit);
  return (
    <View style={styles.container}>
      {ORDER.map((key) => {
        const item = outfit[key];
        if (!item) return null;

        return (
          <OutfitItem
            key={key}
            item={item}
            onPress={onItemPress}
          />
        );
      })}
    </View>
  );
}

/* ------------------------------------------
   Styles
------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  itemContainer: {
    marginVertical: 6,
  },
  image: {
    width: 140,
    height: 140,
  },
});