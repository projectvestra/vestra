import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { getUserProfile, updateUserProfile } from '../src/services/userService';
import { changeCurrentUserPassword, logout } from '../src/services/authService';
import { ui } from '../src/theme/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const profile = await getUserProfile();
        setDarkMode(Boolean(profile?.darkMode));
        setNotifications(profile?.notifications !== false);
      };
      load();
    }, [])
  );

  const handleToggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    await updateUserProfile({ darkMode: value, updatedAt: new Date().toISOString() });
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await updateUserProfile({ notifications: value, updatedAt: new Date().toISOString() });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing details', 'Enter your current password and a new password.');
      return;
    }

    setSavingPassword(true);
    const result = await changeCurrentUserPassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (!result.success) {
      Alert.alert('Password change failed', result.message || 'Please try again.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    Alert.alert('Success', 'Password updated successfully.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.text2 }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
        <View style={styles.row}>
          <View>
            <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
            <Text style={[styles.helper, { color: theme.text2 }]}>Use dark theme across app screens</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: '#d1d5db', true: theme.tint }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={[styles.label, { color: theme.text }]}>Notifications</Text>
            <Text style={[styles.helper, { color: theme.text2 }]}>Outfit reminders and style updates</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#d1d5db', true: theme.tint }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Change Password</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
          placeholder="Current password"
          placeholderTextColor="#9ca3af"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
          placeholder="New password"
          placeholderTextColor="#9ca3af"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={handleChangePassword}
          disabled={savingPassword}
        >
          {savingPassword ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: '#ef4444' }]}
        onPress={async () => {
          await logout();
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: ui.type.title,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  card: {
    borderWidth: 1,
    borderRadius: ui.radius.lg,
    padding: ui.spacing.md,
    marginBottom: 12,
    ...ui.shadow.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  helper: {
    fontSize: 12,
    marginTop: 3,
    maxWidth: 250,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: ui.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: ui.radius.md,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: ui.radius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 28,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '800',
  },
});
