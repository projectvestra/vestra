import { View, Text, StyleSheet } from 'react-native';

export default function Wardrobe() {
  return (
    <View style={styles.container}>
      <Text>Wardrobe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
