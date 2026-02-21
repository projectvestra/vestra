import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../../constants/theme';

export default function MarketplaceProductCard({ product }) {
  const handleBuyNow = () => {
    if (product.affiliateUrl) {
      Linking.openURL(product.affiliateUrl);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        <Text style={styles.price}>
          {product.currency}{product.price}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleBuyNow}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
    color: Colors.light.icon,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  description: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 6,
  },
  price: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  button: {
    marginTop: 10,
    backgroundColor: Colors.light.tint,
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