import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Switch,
  Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth, db } from '../src/services/firebaseConfig';
import { useTheme } from '../src/context/ThemeContext';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { isUsernameTaken, claimUsername } from '../src/services/usernameService';
import { getUserProfile } from '../src/services/userService';

const STYLE_OPTIONS = ['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Bohemian', 'Sporty', 'Vintage'];
const COLOR_OPTIONS = ['Black', 'White', 'Navy', 'Grey', 'Beige', 'Brown', 'Red', 'Green', 'Blue'];
const BODY_TYPES = ['Slim', 'Athletic', 'Regular', 'Plus Size', 'Petite'];

export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Basic info
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Preferences
  const [height, setHeight] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      setDisplayName(user.displayName || '');

      // Load from Firestore
      const ref = doc(db, 'user_profiles', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.username || '');
        setOriginalUsername(data.username || '');
        setHeight(data.height?.toString() || '');
        setBodyType(data.bodyType || '');
        setSelectedStyles(data.styles || []);
        setSelectedColors(data.preferredColors || []);
        setDarkMode(data.darkMode || false);
        setNotifications(data.notifications !== false);
      }
    } catch (e) {
      console.log('Load profile error:', e);
    }
    setLoading(false);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);

    try {
      // Update Firebase Auth display name
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      if (username && username !== originalUsername) {
        const taken = await isUsernameTaken(username);
        if (taken) {
          Alert.alert('Username taken', 'Please choose a different username');
          setSaving(false);
          return;
        }
        await claimUsername(user.uid, username, originalUsername);
      }

      // Save everything to Firestore
      await setDoc(doc(db, 'user_profiles', user.uid), {
        username,
        displayName,
        height: height ? parseInt(height) : null,
        bodyType,
        styles: selectedStyles,
        preferredColors: selectedColors,
        darkMode,
        notifications,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      Alert.alert('Saved', 'Profile updated successfully');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => {
          // Check for changes
          const hasChanges = displayName !== (auth.currentUser?.displayName || '') ||
            username !== originalUsername ||
            newPassword !== '' ||
            height !== '' ||
            bodyType !== '' ||
            selectedStyles.length > 0 ||
            selectedColors.length > 0 ||
            darkMode !== false ||
            notifications !== true;
          if (hasChanges) {
            Alert.alert(
              'Unsaved Changes',
              'You have unsaved changes. Do you want to save them?',
              [
                { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                { text: 'Save', onPress: handleSave },
              ]
            );
          } else {
            router.back();
          }
        }}>
          <Text style={[styles.closeText, { color: theme.text2 }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Basic Info */}
      <Text style={[styles.sectionTitle, { color: theme.text } ]}>Basic Info</Text>

      <Text style={[styles.label, { color: theme.text2 }]}>Display Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.bg2, borderColor: theme.border, color: theme.text }]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your display name"
        placeholderTextColor="#999"
      />

      <Text style={[styles.label, { color: theme.text2 }]}>Username</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.bg2, borderColor: theme.border, color: theme.text }]}
        value={username}
        onChangeText={setUsername}
        placeholder="@username"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: theme.text2 }]}>New Password (leave blank to keep current)</Text>
      <View style={[styles.passwordWrapper, { backgroundColor: theme.bg2, borderColor: theme.border }] }>
        <TextInput
          style={[styles.passwordInput, { color: theme.text }]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
          <Text style={[styles.eyeIcon, { color: theme.text2 }]}>{showPassword ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: theme.text2 }]}>Height (cm)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.bg2, borderColor: theme.border, color: theme.text }]}
        value={height}
        onChangeText={setHeight}
        placeholder="e.g. 175"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      {/* Body Type */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Body Type</Text>
      <View style={styles.chipRow}>
        {BODY_TYPES.map(bt => (
          <TouchableOpacity
            key={bt}
            style={[
              styles.chip,
              { backgroundColor: bodyType === bt ? theme.tint : theme.bg2, borderColor: theme.border },
              bodyType === bt && styles.chipActive,
            ]}
            onPress={() => setBodyType(bt)}
          >
            <Text style={[
              styles.chipText,
              { color: bodyType === bt ? theme.bg : theme.text },
              bodyType === bt && styles.chipTextActive,
            ]}>
              {bt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Style Preferences */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Style Preferences</Text>
      <View style={styles.chipRow}>
        {STYLE_OPTIONS.map(s => (
          <TouchableOpacity
            key={s}
            style={[
              styles.chip,
              { backgroundColor: selectedStyles.includes(s) ? theme.tint : theme.bg2, borderColor: theme.border },
              selectedStyles.includes(s) && styles.chipActive,
            ]}
            onPress={() => toggleStyle(s)}
          >
            <Text style={[
              styles.chipText,
              { color: selectedStyles.includes(s) ? theme.bg : theme.text },
              selectedStyles.includes(s) && styles.chipTextActive,
            ]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Preferences */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferred Colors</Text>
      <View style={styles.chipRow}>
        {COLOR_OPTIONS.map(c => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              { backgroundColor: selectedColors.includes(c) ? theme.tint : theme.bg2, borderColor: theme.border },
              selectedColors.includes(c) && styles.chipActive,
            ]}
            onPress={() => toggleColor(c)}
          >
            <Text style={[
              styles.chipText,
              { color: selectedColors.includes(c) ? theme.bg : theme.text },
              selectedColors.includes(c) && styles.chipTextActive,
            ]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>

      <View style={styles.settingRow}>
        <View>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          <Text style={[styles.settingSubLabel, { color: theme.text2 }]}>Switch to dark theme</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: theme.bg2, true: theme.tint }}
          thumbColor={theme.bg}
        />
      </View>

      <View style={styles.settingRow}>
        <View>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
          <Text style={[styles.settingSubLabel, { color: theme.text2 }]}>Outfit reminders & updates</Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: theme.bg2, true: theme.tint }}
          thumbColor={theme.bg}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.tint }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color={theme.bg} />
          : <Text style={[styles.saveButtonText, { color: theme.bg }]}>Save Changes</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 18 },
  title: { fontSize: 22, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, marginBottom: 14,
  },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15,
  },
  eyeBtn: { paddingHorizontal: 14 },
  eyeIcon: { fontSize: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1, marginBottom: 4,
  },
  chipActive: {},
  chipText: { fontSize: 13 },
  chipTextActive: { fontSize: 13 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1,
  },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingSubLabel: { fontSize: 12, marginTop: 2 },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 28,
  },
  saveButtonText: { fontSize: 16, fontWeight: '600' },
});