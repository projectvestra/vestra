
import { Tabs, usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text,StyleSheet } from 'react-native';
function WardrobeButton() {
  const pathname = usePathname();
  const router = useRouter();

  const isOnWardrobe = pathname === '/tabs/wardrobe';

  const handlePress = () => {
    if (isOnWardrobe) {
      // Add-item flow will be wired later
      console.log('Open add item options');
    } else {
      router.push('/tabs/wardrobe');
    }
  };
   return (
    <TouchableOpacity onPress={handlePress} style={styles.wrapper}>
      <View style={styles.button}>
        <Text style={styles.icon}>
          {isOnWardrobe ? '+' : '👕'}
        </Text>
      </View>
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
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});