import { View, Text, StyleSheet, Image, Pressable, Linking, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ui } from '../theme/ui';

export default function MarketplaceProductCard({ product, isSaved, onToggleSave }) {
  const { theme } = useTheme();

  const handleBuyNow = async () => {
    const webUrl = product.affiliateUrl;
    const deepLinkUrl = product.deepLinkUrl;

    if (!webUrl && !deepLinkUrl) {
      Alert.alert('Link unavailable', 'No product link is available for this item right now.');
      return;
    }

    try {
      if (deepLinkUrl) {
        const canOpenDeepLink = await Linking.canOpenURL(deepLinkUrl);
        if (canOpenDeepLink) {
          await Linking.openURL(deepLinkUrl);
          return;
        }
      }

      if (webUrl) {
        const canOpenWeb = await Linking.canOpenURL(webUrl);
        if (canOpenWeb) {
          await Linking.openURL(webUrl);
          return;
        }
      }

      Alert.alert('Invalid link', 'Unable to open this product link.');
    } catch {
      Alert.alert('Open failed', 'Could not open the product page. Please try again.');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.imageFallbackText}>No image</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.metaHeader}>
          <Text style={[styles.brand, { color: theme.text2 }]} numberOfLines={1}>{product.brand}</Text>
          <View style={[styles.categoryChip, { backgroundColor: theme.bg, borderColor: theme.border }]}> 
            <Text style={[styles.categoryText, { color: theme.text2 }]}>{product.category}</Text>
          </View>
        </View>

        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={[styles.description, { color: theme.text2 }]} numberOfLines={2}>
          {product.description}
        </Text>

        <Text style={[styles.price, { color: theme.text }]}> 
          {product.currency}{product.price}
        </Text>

        <View style={styles.buttonStack}>
          <Pressable
            onPress={handleBuyNow}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.tint, opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.bg }]}>Buy Now</Text>
          </Pressable>

          <Pressable
            onPress={onToggleSave}
            style={({ pressed }) => [
              styles.saveButton,
              { borderColor: theme.border, backgroundColor: pressed ? theme.bg : 'transparent' },
            ]}
          >
            <Text style={[styles.saveButtonText, { color: isSaved ? '#ef4444' : theme.text }]}>
              {isSaved ? 'Wishlisted' : 'Add to Wishlist'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: ui.radius.lg,
    margin: 6,
    overflow: 'hidden',
    borderWidth: 1,
    ...ui.shadow.card,
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageFallback: {
    backgroundColor: '#eef1f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallbackText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: ui.spacing.sm,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  price: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '800',
  },
  buttonStack: {
    marginTop: ui.spacing.xs,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: ui.radius.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 9,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ui.radius.pill,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});