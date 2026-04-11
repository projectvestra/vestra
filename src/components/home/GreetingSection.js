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

export default function GreetingSection() {
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
    <Text style={[styles.greeting, { color: theme.text }]}>
      {getGreeting()}, {userName}
    </Text>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: ui.spacing.lg,
  },
});