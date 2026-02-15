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
} from 'react-native';
import { deleteWardrobeItem } from '../services/wardrobeService';

export default function WardrobeItemCard({ item, onDelete }) {
  const [visible, setVisible] = useState(false);

  const cardScale = useRef(new Animated.Value(1)).current;
  const overlayScale = useRef(new Animated.Value(0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openCard = () => {
    setVisible(true);

    Animated.parallel([
      Animated.spring(overlayScale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeCard = () => {
    Animated.parallel([
      Animated.spring(overlayScale, {
        toValue: 0.8,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWardrobeItem(item.id);
            closeCard();
            if (onDelete) onDelete();
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Grid Card */}
      <Animated.View
        style={[
      styles.cardWrapper,
      { transform: [{ scale: cardScale }] },
  ]}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPressIn={() =>
            Animated.spring(cardScale, {
              toValue: 0.96,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(cardScale, {
              toValue: 1,
              useNativeDriver: true,
            }).start()
          }
          onLongPress={openCard}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.image}
          />
          <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay */}
      <Modal visible={visible} transparent>
        <Pressable
          style={styles.overlay}
          onPress={closeCard}
        >
          <Animated.View
            style={[
              styles.expandedCard,
              {
                transform: [{ scale: overlayScale }],
                opacity: overlayOpacity,
              },
            ]}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.largeImage}
            />

            <Text style={styles.title}>{item.name}</Text>

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: item.color || '#ccc' },
                ]}
              />
              <Text style={styles.metaText}>
                {item.category}
              </Text>
            </View>

            {item.size && (
              <Text style={styles.metaText}>
                Size: {item.size}
              </Text>
            )}

            {item.fit && (
              <Text style={styles.metaText}>
                Fit: {item.fit}
              </Text>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={{ color: '#fff' }}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
  backgroundColor: '#f8f8f8',
  borderRadius: 12,
  padding: 8,
  },
  // list: {
  //   paddingTop:16,
  //   paddingBottom:32,
  // },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  name: {
    marginTop: 8,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
  },
  largeImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '600',
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
  },
  deleteButton: {
    marginTop: 18,
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  cardWrapper:{
    flex: 1,
    margin:6,
  },
});
