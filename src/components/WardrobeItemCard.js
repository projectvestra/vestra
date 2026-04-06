import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  Alert,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { deleteWardrobeItemCloud, updateWardrobeItem } from '../services/cloudWardrobeService';
import { getShoppingLinks } from '../services/shopSearchService';

const CATEGORIES = ['Shirts', 'Pants', 'Shoes', 'Accessories'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES_US = ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
const SHOE_SIZES_UK = ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
const SHOE_SIZES_EU = ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'];
const FITS = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Skinny', 'Straight', 'Wide Leg', 'Tapered'];

export default function WardrobeItemCard({ item, onDelete, onEdit }) {
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [shopMode, setShopMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editCategory, setEditCategory] = useState(item.category || 'Shirts');
  const [editSize, setEditSize] = useState(item.size || null);
  const [editFit, setEditFit] = useState(item.fit || null);

  const cardScale = useRef(new Animated.Value(1)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openCard = () => {
    setVisible(true);
    setEditMode(false);
    setShopMode(false);
    Animated.parallel([
      Animated.spring(overlayScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeCard = () => {
    Animated.parallel([
      Animated.spring(overlayScale, { toValue: 0.8, friction: 6, tension: 120, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      setEditMode(false);
      setShopMode(false);
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWardrobeItemCloud(item.id);
          closeCard();
          if (onDelete) onDelete();
        },
      },
    ]);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateWardrobeItem(item.id, {
        category: editCategory,
        size: editSize,
        fit: editFit,
        colorName: item.colorName,
        colorHex: item.color,
      });
      closeCard();
      if (onEdit) onEdit();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const shoppingLinks = getShoppingLinks({
    category: item.category,
    name: item.name,
    colorName: item.colorName,
  });

  const isShoe = (editCategory || '').toLowerCase().includes('shoe');

  return (
    <>
      {/* Grid Card */}
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPressIn={() => Animated.spring(cardScale, { toValue: 0.96, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }).start()}
          onLongPress={openCard}
          onPress={openCard}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <Text style={styles.name} numberOfLines={1}>{item.name || item.category}</Text>
          {item.size && <Text style={styles.sizeTag}>{item.size}</Text>}
        </TouchableOpacity>
      </Animated.View>

      {/* Detail / Edit / Shop Modal */}
      <Modal visible={visible} transparent animationType="none">
        <Pressable style={styles.overlay} onPress={closeCard}>
          <Animated.View
            style={[styles.expandedCard, { transform: [{ scale: overlayScale }], opacity: overlayOpacity }]}
          >
            <Pressable onPress={() => {}}>

              {/* ── VIEW MODE ── */}
              {!editMode && !shopMode && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Image source={{ uri: item.image }} style={styles.largeImage} />
                  <Text style={styles.title}>{item.name || item.category}</Text>

                  <View style={styles.metaRow}>
                    <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
                    <Text style={styles.metaText}>{item.colorName || item.category}</Text>
                  </View>
                  {item.size && <Text style={styles.metaText}>Size: {item.size}</Text>}
                  {item.fit && <Text style={styles.metaText}>Fit: {item.fit}</Text>}

                  {/* Action buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                      <Text style={styles.editButtonText}>✎ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shopButton} onPress={() => setShopMode(true)}>
                      <Text style={styles.shopButtonText}>🛍 Shop</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={{ color: '#fff' }}>Delete</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}

              {/* ── EDIT MODE ── */}
              {editMode && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.title}>Edit Item</Text>

                  <Text style={styles.sectionLabel}>Category</Text>
                  <View style={styles.chipRow}>
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.chip, editCategory === cat && styles.chipActive]}
                        onPress={() => { setEditCategory(cat); setEditSize(null); }}
                      >
                        <Text style={editCategory === cat ? styles.chipTextActive : styles.chipText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.sectionLabel}>Size</Text>
                  {isShoe ? (
                    <>
                      <Text style={styles.subLabel}>US</Text>
                      <View style={styles.chipRow}>
                        {SHOE_SIZES_US.map(s => (
                          <TouchableOpacity key={s} style={[styles.chip, editSize === s && styles.chipActive]} onPress={() => setEditSize(s)}>
                            <Text style={editSize === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={styles.subLabel}>UK</Text>
                      <View style={styles.chipRow}>
                        {SHOE_SIZES_UK.map(s => (
                          <TouchableOpacity key={s} style={[styles.chip, editSize === s && styles.chipActive]} onPress={() => setEditSize(s)}>
                            <Text style={editSize === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={styles.subLabel}>EU</Text>
                      <View style={styles.chipRow}>
                        {SHOE_SIZES_EU.map(s => (
                          <TouchableOpacity key={s} style={[styles.chip, editSize === s && styles.chipActive]} onPress={() => setEditSize(s)}>
                            <Text style={editSize === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  ) : (
                    <View style={styles.chipRow}>
                      {CLOTHING_SIZES.map(s => (
                        <TouchableOpacity key={s} style={[styles.chip, editSize === s && styles.chipActive]} onPress={() => setEditSize(s)}>
                          <Text style={editSize === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {!isShoe && (
                    <>
                      <Text style={styles.sectionLabel}>Fit</Text>
                      <View style={styles.chipRow}>
                        {FITS.map(f => (
                          <TouchableOpacity key={f} style={[styles.chip, editFit === f && styles.chipActive]} onPress={() => setEditFit(f)}>
                            <Text style={editFit === f ? styles.chipTextActive : styles.chipText}>{f}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(false)}>
                      <Text style={styles.editButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shopButton} onPress={handleSaveEdit} disabled={saving}>
                      <Text style={styles.shopButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}

              {/* ── SHOP MODE ── */}
              {shopMode && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.title}>Shop this item</Text>
                  <Image source={{ uri: item.image }} style={styles.shopPreviewImg} />
                  <Text style={styles.shopItemName}>{item.colorName} {item.category}</Text>

                  <Text style={styles.sectionLabel}>Find exact or similar item on:</Text>

                  {/* Platform buttons */}
                  {[
                    { name: 'Myntra', color: '#FF3F6C', url: shoppingLinks.myntra },
                    { name: 'Meesho', color: '#9B1FE8', url: shoppingLinks.meesho },
                    { name: 'Flipkart', color: '#2874F0', url: shoppingLinks.flipkart },
                    { name: 'Amazon', color: '#FF9900', url: shoppingLinks.amazon },
                  ].map(platform => (
                    <TouchableOpacity
                      key={platform.name}
                      style={[styles.platformBtn, { borderColor: platform.color }]}
                      onPress={() => Linking.openURL(platform.url)}
                    >
                      <View style={[styles.platformDot, { backgroundColor: platform.color }]} />
                      <Text style={[styles.platformBtnText, { color: platform.color }]}>
                        Search on {platform.name}
                      </Text>
                      <Text style={styles.platformArrow}>→</Text>
                    </TouchableOpacity>
                  ))}

                  <Text style={styles.shopNote}>
                    Opens search for "{item.colorName} {item.category}" on each platform
                  </Text>

                  <TouchableOpacity style={styles.editButton} onPress={() => setShopMode(false)}>
                    <Text style={styles.editButtonText}>← Back</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}

            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: 6,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  name: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 13,
    color: '#111',
  },
  sizeTag: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedCard: {
    width: '88%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
  },
  largeImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  metaText: {
    marginTop: 6,
    color: '#555',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#000',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  shopButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 13,
    color: '#333',
  },
  subLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 6,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 4,
  },
  chipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  chipText: {
    fontSize: 12,
    color: '#444',
  },
  chipTextActive: {
    fontSize: 12,
    color: '#fff',
  },
  shopPreviewImg: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 12,
  },
  shopItemName: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  platformBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  platformDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  platformBtnText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
  },
  platformArrow: {
    color: '#999',
    fontSize: 16,
  },
  shopNote: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});