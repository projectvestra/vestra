import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  uploadWardrobeImage,
  createWardrobeItem
} from '../src/services/cloudWardrobeService';

const CATEGORIES = [
  'Shirts', 'Pants', 'Shoes', 'Jackets',
  'Hoodies', 'Sunglasses', 'Accessories'
];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES_US = ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
const SHOE_SIZES_UK = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
const SHOE_SIZES_EU = ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'];
const FITS = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Skinny', 'Straight', 'Wide Leg', 'Tapered'];
const COLOR_OPTIONS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Brown', hex: '#8B5E3C' },
  { name: 'Beige', hex: '#D6C4A0' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Pink', hex: '#DB2777' },
  { name: 'Purple', hex: '#7C3AED' },
];

const NO_SIZE_CATEGORIES = ['Sunglasses', 'Accessories'];
const NO_FIT_CATEGORIES = ['Shoes', 'Sunglasses', 'Accessories'];

export default function AddItem() {
  const router = useRouter();
  const [category, setCategory] = useState('Shirts');
  const [size, setSize] = useState(null);
  const [fit, setFit] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState([COLOR_OPTIONS[0]]);

  const isShoe = category === 'Shoes';
  const showSize = !NO_SIZE_CATEGORIES.includes(category);
  const showFit = !NO_FIT_CATEGORIES.includes(category);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission required'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission required'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const toggleColor = (colorOption) => {
    setSelectedColors((prev) => {
      const exists = prev.some((color) => color.name === colorOption.name);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((color) => color.name !== colorOption.name);
      }

      if (prev.length >= 3) {
        return [...prev.slice(1), colorOption];
      }

      return [...prev, colorOption];
    });
  };

  const handleSave = async () => {
    if (!imageUri) { Alert.alert('Please select an image'); return; }
    setLoading(true);
    try {
      const imageUrl = await uploadWardrobeImage(imageUri);
      const primaryColor = selectedColors[0] || COLOR_OPTIONS[0];
      await createWardrobeItem({
        imageUrl,
        category,
        colorName: primaryColor.name,
        colorHex: primaryColor.hex,
        colorNames: selectedColors.map((color) => color.name),
        colorHexes: selectedColors.map((color) => color.hex),
        size: showSize ? size : null,
        fit: showFit ? fit : null,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Item</Text>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text>Select from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.imageButton} onPress={openCamera}>
        <Text>Use Camera</Text>
      </TouchableOpacity>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Category */}
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.row}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => { setCategory(cat); setSize(null); setFit(null); }}
            style={[styles.chip, category === cat && styles.activeChip]}
          >
            <Text style={category === cat ? styles.activeChipText : styles.chipText}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Optional badge for jacket/sunglasses */}
      {(category === 'Jackets' || category === 'Hoodies' || category === 'Sunglasses') && (
        <View style={styles.optionalBadge}>
          <Text style={styles.optionalText}>
            {category === 'Sunglasses'
              ? 'Sunglasses are optional in outfit generation'
              : `${category} appear in Winter Mode only`}
          </Text>
        </View>
      )}

      {/* Size */}
      {showSize && (
        <>
          <Text style={styles.sectionTitle}>Size</Text>
          {isShoe ? (
            <>
              <Text style={styles.subLabel}>US</Text>
              <View style={styles.row}>
                {SHOE_SIZES_US.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSize(s)}
                    style={[styles.chip, size === s && styles.activeChip]}>
                    <Text style={size === s ? styles.activeChipText : styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.subLabel}>UK</Text>
              <View style={styles.row}>
                {SHOE_SIZES_UK.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSize(s)}
                    style={[styles.chip, size === s && styles.activeChip]}>
                    <Text style={size === s ? styles.activeChipText : styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.subLabel}>EU</Text>
              <View style={styles.row}>
                {SHOE_SIZES_EU.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSize(s)}
                    style={[styles.chip, size === s && styles.activeChip]}>
                    <Text style={size === s ? styles.activeChipText : styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.row}>
              {CLOTHING_SIZES.map((s) => (
                <TouchableOpacity key={s} onPress={() => setSize(s)}
                  style={[styles.chip, size === s && styles.activeChip]}>
                  <Text style={size === s ? styles.activeChipText : styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {/* Fit */}
      {showFit && (
        <>
          <Text style={styles.sectionTitle}>Fit (optional)</Text>
          <View style={styles.row}>
            {FITS.map((f) => (
              <TouchableOpacity key={f} onPress={() => setFit(f)}
                style={[styles.chip, fit === f && styles.activeChip]}>
                <Text style={fit === f ? styles.activeChipText : styles.chipText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Colors (pick up to 3)</Text>
      <View style={styles.row}>
        {COLOR_OPTIONS.map((colorOption) => {
          const isSelected = selectedColors.some((color) => color.name === colorOption.name);
          return (
            <TouchableOpacity
              key={colorOption.name}
              onPress={() => toggleColor(colorOption)}
              style={[styles.colorChip, isSelected && styles.activeColorChip]}
            >
              <View style={[styles.colorDot, { backgroundColor: colorOption.hex }]} />
              <Text style={isSelected ? styles.activeChipText : styles.chipText}>{colorOption.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={{ color: '#fff' }}>{loading ? 'Saving...' : 'Save Item'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: '500', fontSize: 15 },
  subLabel: { fontSize: 12, color: '#888', marginTop: 8, marginBottom: 4, fontWeight: '500' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 8, marginBottom: 8,
  },
  activeChip: { backgroundColor: '#000' },
  chipText: { color: '#333' },
  activeChipText: { color: '#fff' },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  activeColorChip: { backgroundColor: '#000' },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 6,
  },
  imageButton: {
    paddingVertical: 12, backgroundColor: '#f4f4f4',
    borderRadius: 8, marginBottom: 10, alignItems: 'center',
  },
  preview: { width: '100%', height: 200, borderRadius: 12, marginVertical: 16 },
  saveButton: {
    backgroundColor: '#000', paddingVertical: 14,
    borderRadius: 8, alignItems: 'center', marginTop: 20,
  },
  optionalBadge: {
    backgroundColor: '#f0f7ff', borderRadius: 8,
    padding: 10, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#3b82f6',
  },
  optionalText: { fontSize: 12, color: '#3b82f6' },
});