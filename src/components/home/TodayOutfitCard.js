import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';

export default function TodayOutfitCard({ outfit }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today's Outfit</Text>

      <View style={styles.row}>
        {outfit.shirt && (
          <Image source={{ uri: outfit.shirt.image }} style={styles.image} />
        )}
        {outfit.pants && (
          <Image source={{ uri: outfit.pants.image }} style={styles.image} />
        )}
        {outfit.shoes && (
          <Image source={{ uri: outfit.shoes.image }} style={styles.image} />
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: '#fff' }}>Why this outfit?</Text>
      </TouchableOpacity>

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    width: 90,
    height: 120,
    borderRadius: 10,
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
