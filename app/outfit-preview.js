import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OutfitPreview from '../src/components/OutfitPreview';

export default function OutfitPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  let outfit = null;

  try {
    outfit = JSON.parse(params.outfit || '{}');
  } catch (e) {
    console.log('Outfit parse error:', e);
  }

  if (!outfit || Object.keys(outfit).length === 0) {
    return null;
  }

  const handleItemPress = (item) => {
    router.push({
      pathname: '/tabs/wardrobe',
      params: { highlightId: item.id },
    });
  };

  return (
    <View style={styles.container}>
      
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* 🔥 Fullscreen Outfit */}
      <OutfitPreview
        outfit={outfit}
        onItemPress={handleItemPress}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});