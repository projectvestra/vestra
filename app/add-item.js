import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { addWardrobeItem } from '../src/services/wardrobeService';

const CATEGORIES = ['Shirts', 'Pants', 'Shoes', 'Accessories'];

export default function AddItem() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [color, setColor] = useState('#cccccc');
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required to access gallery');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required to access camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Item name is required');
      return;
    }

    addWardrobeItem({
      name,
      category,
      color,
      image: imageUri,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Item</Text>

      <TextInput
        placeholder="Item Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[
              styles.categoryChip,
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

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text>Select from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.imageButton} onPress={openCamera}>
        <Text>Use Camera</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
        />
      )}

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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
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
    height: 180,
    borderRadius: 12,
    marginVertical: 16,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
