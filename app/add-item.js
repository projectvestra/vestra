import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageColors from 'react-native-image-colors';
import { useRouter } from 'expo-router';
import { addWardrobeItem } from '../src/services/wardrobeService';

const CATEGORIES = ['Shirts', 'Pants', 'Shoes', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const FITS = ['Slim', 'Regular', 'Oversized'];

function getColorName(hex) {
  if (!hex) return 'Unknown';

  const colorMap = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0000ff' },
    { name: 'Green', value: '#008000' },
    { name: 'Grey', value: '#808080' },
    { name: 'Brown', value: '#8b4513' },
  ];

  // Very simple distance comparison
  const hexToRgb = (h) => {
    const bigint = parseInt(h.replace('#', ''), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255,
    ];
  };

  const [r1, g1, b1] = hexToRgb(hex);

  let closest = 'Unknown';
  let minDistance = Infinity;

  colorMap.forEach((color) => {
    const [r2, g2, b2] = hexToRgb(color.value);
    const distance =
      (r1 - r2) ** 2 +
      (g1 - g2) ** 2 +
      (b1 - b2) ** 2;

    if (distance < minDistance) {
      minDistance = distance;
      closest = color.name;
    }
  });

  return closest;
}

export default function AddItem() {
  const router = useRouter();

  const [category, setCategory] = useState('Shirts');
  const [size, setSize] = useState(null);
  const [fit, setFit] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [dominantColor, setDominantColor] = useState(null);
  const [colorName, setColorName] = useState(null);

  const extractColor = async (uri) => {
    try {
      const result = await ImageColors.getColors(uri, {
        fallback: '#000000',
        cache: true,
      });

      const hex =
        result.platform === 'android'
          ? result.dominant
          : result.background;

      setDominantColor(hex);
      setColorName(getColorName(hex));
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await extractColor(uri);
    }
  };

  const openCamera = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await extractColor(uri);
    }
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('Please select an image');
      return;
    }

    const generatedName =
      (colorName || 'Unknown') + ' ' + category;

    await addWardrobeItem({
      name: generatedName,
      category,
      color: dominantColor,
      size,
      fit,
      image: imageUri,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Item</Text>

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text>Select from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.imageButton} onPress={openCamera}>
        <Text>Use Camera</Text>
      </TouchableOpacity>

      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          {colorName && (
            <Text style={styles.colorText}>
              Detected Color: {colorName}
            </Text>
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.row}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[
              styles.chip,
              category === cat && styles.activeChip,
            ]}
          >
            <Text
              style={
                category === cat
                  ? styles.activeChipText
                  : styles.chipText
              }
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Size (optional)</Text>
      <View style={styles.row}>
        {SIZES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSize(s)}
            style={[
              styles.chip,
              size === s && styles.activeChip,
            ]}
          >
            <Text
              style={
                size === s
                  ? styles.activeChipText
                  : styles.chipText
              }
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Fit (optional)</Text>
      <View style={styles.row}>
        {FITS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFit(f)}
            style={[
              styles.chip,
              fit === f && styles.activeChip,
            ]}
          >
            <Text
              style={
                fit === f
                  ? styles.activeChipText
                  : styles.chipText
              }
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={{ color: '#fff' }}>Save Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: '#000',
  },
  chipText: {
    color: '#333',
  },
  activeChipText: {
    color: '#fff',
  },
  imageButton: {
    paddingVertical: 12,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 16,
  },
  colorText: {
    marginBottom: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});
