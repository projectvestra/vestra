import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ui } from '../../theme/ui';

export default function TodayOutfitCard({ outfit }) {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.text2 }]}>Recommended fit</Text>
          <Text style={[styles.title, { color: theme.text }]}>Today&apos;s Outfit</Text>
        </View>
      </View>

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
        style={[styles.button, { backgroundColor: theme.tint }]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.buttonText, { color: theme.bg }]}>Why this outfit?</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
            <Text style={[styles.modalTitle, { color: theme.text }]}>Style note</Text>
            <Text style={[styles.modalText, { color: theme.text2 }]}>{outfit.explanation}</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.tint }]}
              onPress={() => setVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: theme.bg }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: ui.spacing.xl,
    padding: ui.spacing.md,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    ...ui.shadow.card,
  },
  headerRow: { marginBottom: ui.spacing.md },
  eyebrow: { fontSize: ui.type.eyebrow, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  title: {
    fontSize: ui.type.section,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  image: {
    width: '31%',
    height: 124,
    borderRadius: ui.radius.md,
    backgroundColor: '#e5e7eb',
  },
  button: {
    marginTop: ui.spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: ui.radius.md,
  },
  buttonText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '84%',
    padding: 20,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  modalText: { fontSize: 14, lineHeight: 21 },
  closeBtn: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
    borderRadius: ui.radius.md,
  },
  closeBtnText: {
    fontWeight: '700',
  },
});
