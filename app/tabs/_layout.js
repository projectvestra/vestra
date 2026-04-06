import { Tabs, usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

function WardrobeButton() {
  const pathname = usePathname();
  const router = useRouter();
  const isOnWardrobe = pathname === '/tabs/wardrobe';
  return (
    <TouchableOpacity
      onPress={() => router.push(isOnWardrobe ? '/add-item' : '/tabs/wardrobe')}
      style={styles.wrapper}
    >
      <View style={styles.button}>
        <Text style={styles.icon}>{isOnWardrobe ? '+' : '👗'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.bg2,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.icon,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🧭' : '✨'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: '',
          tabBarButton: (props) => <WardrobeButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🔎' : '🔍'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '👤' : '👥'}</Text>
          ),
        }}
      />
      {/* Planner hidden from tab bar but still accessible via router.push */}
      <Tabs.Screen
        name="planner"
        options={{
          href: null, // hides from tab bar completely
        }}
      />
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: { color: '#fff', fontSize: 22 },
});