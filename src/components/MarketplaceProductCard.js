import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function MarketplaceProductCard({ product }) {
  const { theme } = useTheme();

  const handleBuyNow = async () => {
    if (product.affiliateUrl) {
      const canOpen = await Linking.canOpenURL(product.affiliateUrl);
      if (canOpen) {
        await Linking.openURL(product.affiliateUrl);
      }
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.bg2 }]}> 
      <Image source={{ uri: product.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={[styles.brand, { color: theme.icon }]}>{product.brand}</Text>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={[styles.description, { color: theme.icon }]} numberOfLines={2}>
          {product.description}
        </Text>

        <Text style={[styles.price, { color: theme.text }]}> 
          {product.currency}{product.price}
        </Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.tint }]} onPress={handleBuyNow}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    margin: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: 6,
  },
  price: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});