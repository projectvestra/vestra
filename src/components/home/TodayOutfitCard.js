import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import OutfitPreview from '../OutfitPreview';

export default function TodayOutfitCard({ outfit }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  if (!outfit || Object.keys(outfit).length === 0) {
  return null;
}

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today's Outfit</Text>

      {/* 🔥 New 2D Outfit Preview */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/outfit-preview',
            params: { outfit: JSON.stringify(outfit) },
          })
        }
      >
        <OutfitPreview
          outfit={outfit}
          onItemPress={(item) =>
            router.push({
              pathname: '/tabs/wardrobe',
              params: { highlightId: item.id },
            })
          }
        />
      </TouchableOpacity>

      {/* Explanation Button (unchanged) */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: '#fff' }}>Why this outfit?</Text>
      </TouchableOpacity>

      {/* Modal (unchanged) */}
      <Modal visible={visible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>{outfit.explanation}</Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f4f4f4',
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: '#000',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
});