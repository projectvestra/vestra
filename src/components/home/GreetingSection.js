import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { auth } from '../../services/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { ui } from '../../theme/ui';

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
    <View style={[styles.container, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
      <Text style={[styles.eyebrow, { color: theme.text2 }]}>Wardrobe snapshot</Text>
      <Text style={[styles.greeting, { color: theme.text }]}>
        {getGreeting()}, {userName}
      </Text>
      <View style={[styles.summaryBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <Text style={[styles.summaryText, { color: theme.text2 }]}>
          {totalItems} pieces in your wardrobe
        </Text>
        {recentItem && (
          <Text style={[styles.summaryText, { color: theme.text2 }]}>
            Recent: {recentItem.name || recentItem.category}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: ui.spacing.lg,
    padding: ui.spacing.md,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    ...ui.shadow.card,
  },
  eyebrow: {
    fontSize: ui.type.eyebrow,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryBox: {
    marginTop: ui.spacing.sm,
    padding: ui.spacing.md,
    borderRadius: ui.radius.md,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});