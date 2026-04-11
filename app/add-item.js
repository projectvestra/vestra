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
import { useTheme } from '../src/context/ThemeContext';
import {
  uploadWardrobeImage,
  createWardrobeItem
} from '../src/services/cloudWardrobeService';
import { ui } from '../src/theme/ui';

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
  const { theme } = useTheme();
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
      mediaTypes: ['images'],
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
      router.replace({ pathname: '/tabs/wardrobe', params: { toast: 'item-added' } });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>Add Item</Text>

      {/* Image Picker */}
      <TouchableOpacity style={[styles.imageButton, { backgroundColor: theme.bg2, borderColor: theme.border }]} onPress={pickImage}>
        <Text style={[styles.imageButtonText, { color: theme.text }]}>Select from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.imageButton, { backgroundColor: theme.bg2, borderColor: theme.border }]} onPress={openCamera}>
        <Text style={[styles.imageButtonText, { color: theme.text }]}>Use Camera</Text>
      </TouchableOpacity>
      {imageUri && (
        <View style={styles.previewWrap}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          <TouchableOpacity style={styles.removePreviewBtn} onPress={() => setImageUri(null)}>
            <Text style={styles.removePreviewText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Category</Text>
      <View style={styles.row}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => { setCategory(cat); setSize(null); setFit(null); }}
            style={[styles.chip, { backgroundColor: category === cat ? theme.tint : theme.bg2, borderColor: theme.border }]}
          >
            <Text style={[styles.chipText, { color: category === cat ? theme.bg : theme.text }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Optional badge for jacket/sunglasses */}
      {(category === 'Jackets' || category === 'Hoodies' || category === 'Sunglasses') && (
        <View style={[styles.optionalBadge, { backgroundColor: theme.bg2, borderLeftColor: theme.tint }]}>
          <Text style={[styles.optionalText, { color: theme.text2 }]}>
            {category === 'Sunglasses'
              ? 'Sunglasses are optional in outfit generation'
              : `${category} appear in Winter Mode only`}
          </Text>
        </View>
      )}

      {/* Size */}
      {showSize && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Size</Text>
          {isShoe ? (
            <>
              <Text style={[styles.subLabel, { color: theme.text2 }]}>US</Text>
              <View style={styles.row}>
                {SHOE_SIZES_US.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSize(s)}
                    style={[styles.chip, { backgroundColor: size === s ? theme.tint : theme.bg2, borderColor: theme.border }]}>
                    <Text style={[styles.chipText, { color: size === s ? theme.bg : theme.text }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.subLabel, { color: theme.text2 }]}>UK</Text>
              <View style={styles.row}>
                {SHOE_SIZES_UK.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSize(s)}
                    style={[styles.chip, { backgroundColor: size === s ? theme.tint : theme.bg2, borderColor: theme.border }]}>
                    <Text style={[styles.chipText, { color: size === s ? theme.bg : theme.text }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.subLabel, { color: theme.text2 }]}>EU</Text>
              <View style={styles.row}>
                {SHOE_SIZES_EU.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setSize(s)}
                    style={[styles.chip, { backgroundColor: size === s ? theme.tint : theme.bg2, borderColor: theme.border }]}>
                    <Text style={[styles.chipText, { color: size === s ? theme.bg : theme.text }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.row}>
              {CLOTHING_SIZES.map((s) => (
                <TouchableOpacity key={s} onPress={() => setSize(s)}
                  style={[styles.chip, { backgroundColor: size === s ? theme.tint : theme.bg2, borderColor: theme.border }]}>
                  <Text style={[styles.chipText, { color: size === s ? theme.bg : theme.text }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {/* Fit */}
      {showFit && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Fit (optional)</Text>
          <View style={styles.row}>
            {FITS.map((f) => (
              <TouchableOpacity key={f} onPress={() => setFit(f)}
                style={[styles.chip, { backgroundColor: fit === f ? theme.tint : theme.bg2, borderColor: theme.border }]}>
                <Text style={[styles.chipText, { color: fit === f ? theme.bg : theme.text }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Colors (pick up to 3)</Text>
      <View style={styles.row}>
        {COLOR_OPTIONS.map((colorOption) => {
          const isSelected = selectedColors.some((color) => color.name === colorOption.name);
          return (
            <TouchableOpacity
              key={colorOption.name}
              onPress={() => toggleColor(colorOption)}
              style={[styles.colorChip, { backgroundColor: isSelected ? theme.tint : theme.bg2, borderColor: theme.border }]}
            >
              <View style={[styles.colorDot, { backgroundColor: colorOption.hex }]} />
              <Text style={[styles.chipText, { color: isSelected ? theme.bg : theme.text }]}>{colorOption.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.tint }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={[styles.saveButtonText, { color: theme.bg }]}>{loading ? 'Saving...' : 'Save Item'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: ui.type.title, fontWeight: '800', marginBottom: 20, letterSpacing: -0.4 },
  sectionTitle: { marginTop: ui.spacing.lg, marginBottom: 8, fontWeight: '800', fontSize: 15, letterSpacing: -0.2 },
  subLabel: { fontSize: 11, color: '#888', marginTop: 8, marginBottom: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: ui.radius.pill,
    backgroundColor: '#eee', marginRight: 8, marginBottom: 8,
    borderWidth: 1,
  },
  chipText: { color: '#333', fontSize: 12, fontWeight: '600' },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: ui.radius.pill,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 6,
  },
  imageButton: {
    paddingVertical: 13,
    borderRadius: ui.radius.md,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  imageButtonText: { fontSize: 14, fontWeight: '700' },
  previewWrap: { width: '100%', height: 220, borderRadius: ui.radius.lg, marginVertical: 16, backgroundColor: '#f5f5f5', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  removePreviewBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(17,17,17,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePreviewText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  saveButton: {
    paddingVertical: 14,
    borderRadius: ui.radius.md,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { fontWeight: '800', fontSize: 14 },
  optionalBadge: {
    backgroundColor: '#f0f7ff',
    borderRadius: ui.radius.md,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  optionalText: { fontSize: 12, lineHeight: 18 },
});