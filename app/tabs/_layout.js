import { Tabs } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
function WardrobeButton(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={styles.wrapper}
      accessibilityRole="button"
    >
      <View style={styles.button} />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />

      <Tabs.Screen
        name="wardrobe"
        options={{
          title: '',
          tabBarButton: (props) => <WardrobeButton {...props} />,
        }}
      />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
  },
});