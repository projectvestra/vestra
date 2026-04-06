import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { auth } from '../../services/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function GreetingSection({ totalItems, recentItem }) {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const name = user.displayName
        ? user.displayName.split(' ')[0]
        : user.email?.split('@')[0] || 'there';
      setUserName(name);
    }
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u) {
        const name = u.displayName
          ? u.displayName.split(' ')[0]
          : u.email?.split('@')[0] || 'there';
        setUserName(name);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.greeting, { color: theme.text }]}>
        {getGreeting()}, {userName} 👋
      </Text>
      <View style={[styles.summaryBox, { backgroundColor: theme.card }]}>
        <Text style={[styles.summaryText, { color: theme.text2 }]}>
          {totalItems} items in your wardrobe
        </Text>
        {recentItem && (
          <Text style={[styles.summaryText, { color: theme.text2 }]}>
            Recently Added: {recentItem.name || recentItem.category}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  greeting: { fontSize: 24, fontWeight: '600' },
  summaryBox: { marginTop: 10, padding: 14, borderRadius: 12 },
  summaryText: { fontSize: 14, marginBottom: 4 },
});