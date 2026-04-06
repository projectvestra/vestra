import {
  ScrollView, View, Text, StyleSheet,
  TouchableOpacity, FlatList, Switch,
} from "react-native";
import { useState, useMemo, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getUserProfile, updateUserProfile } from "../../src/services/userService";
import { auth } from "../../src/services/firebaseConfig";
import ProfileSectionCard from "../../src/components/ProfileSectionCard";
import ProfileStatCard from "../../src/components/ProfileStatCard";
import UsernameModal from "../../src/components/UsernameModal";
import { logout } from "../../src/services/authService";
import { getUserWardrobeItems } from "../../src/services/cloudWardrobeService";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleToggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    await updateUserProfile({ darkMode: value });
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await updateUserProfile({ notifications: value });
  };

  /* Load Profile */
  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          // Force reload auth to get latest displayName
          await auth.currentUser?.reload();
          const user = auth.currentUser;
          const preferences = await getUserProfile();

          setProfile({
            name: user?.displayName
              ? user.displayName
              : user?.email?.split('@')[0] || 'User',
            email: user?.email || '',
            height: preferences?.height || '',
            bodyType: preferences?.bodyType || '',
            styles: preferences?.styles || [],
            colors: preferences?.preferredColors || [],
            constraints: preferences?.constraints || [],
            username: preferences?.username || '',
          });

          // Load saved settings
          setDarkMode(preferences?.darkMode || false);
          setNotifications(preferences?.notifications !== false);
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      };
      loadProfile();
    }, [])
  );

  /* Load Wardrobe */
  useFocusEffect(
    useCallback(() => {
      const loadWardrobe = async () => {
        try {
          const data = await getUserWardrobeItems();
          setWardrobeItems(data?.items || []);
        } catch (error) {
          setWardrobeItems([]);
        } finally {
          setLoading(false);
        }
      };
      loadWardrobe();
    }, [])
  );

  /* Wardrobe Stats */
  const stats = useMemo(() => {
    const breakdown: Record<string, number> = {
      Shirts: 0, Pants: 0, Shoes: 0,
      Accessories: 0, Jackets: 0, Hoodies: 0,
    };
    wardrobeItems.forEach((item: any) => {
      const cat = item?.category;
      if (cat && breakdown[cat] !== undefined) breakdown[cat]++;
    });
    return { total: wardrobeItems.length, breakdown };
  }, [wardrobeItems]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingBottom: 40, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onLongPress={() => router.push('/dev-notifications')}
          delayLongPress={1500}
          activeOpacity={1}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </TouchableOpacity>

        {profile?.username ? (
          <Text style={[styles.username, { color: theme.icon }]}>@{profile.username}</Text>
        ) : null}
        <Text style={[styles.name, { color: theme.text }]}>{profile?.name || 'Loading...'}</Text>
        <Text style={[styles.email, { color: theme.icon }]}>{profile?.email}</Text>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.tint }]}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* STYLE IDENTITY */}
      <ProfileSectionCard title="Style Identity">
        <Text style={[styles.metaText, { color: theme.text }]}> 
          Preferred Styles: {profile?.styles?.join(', ') || '—'}
        </Text>
        <Text style={[styles.metaText, { color: theme.text }]}> 
          Colors: {profile?.colors?.join(', ') || '—'}
        </Text>
        <Text style={[styles.metaText, { color: theme.text }]}> 
          Body Type: {profile?.bodyType || '—'}
        </Text>
        <Text style={[styles.metaText, { color: theme.text }]}> 
          Height: {profile?.height ? `${profile.height} cm` : '—'}
        </Text>
      </ProfileSectionCard>

      {/* WARDROBE INSIGHTS */}
      <ProfileSectionCard title="Wardrobe Insights">
        {loading ? (
          <Text style={[styles.metaText, { color: theme.text }]}>Loading wardrobe...</Text>
        ) : (
          <View style={styles.statGrid}>
            <ProfileStatCard value={stats.total} label="Total Items" />
            <ProfileStatCard value={stats.breakdown.Shirts} label="Shirts" />
            <ProfileStatCard value={stats.breakdown.Pants} label="Pants" />
            <ProfileStatCard value={stats.breakdown.Shoes} label="Shoes" />
            <ProfileStatCard value={stats.breakdown.Accessories} label="Accessories" />
          </View>
        )}
      </ProfileSectionCard>

      {/* SETTINGS */}
      <ProfileSectionCard title="Settings">

        {/* Set Username */}
        <TouchableOpacity
          style={styles.settingBtn}
          onPress={() => setUsernameModalVisible(true)}
        >
          <Text style={[styles.settingBtnText, { color: theme.text }]}>
            {profile?.username ? `👤 Change Username (@${profile.username})` : '👤 Set Username'}
          </Text>
        </TouchableOpacity>

        {/* Dark Mode */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: '#ddd', true: '#000' }}
            thumbColor="#fff"
          />
        </View>

        {/* Notifications */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#ddd', true: '#000' }}
            thumbColor="#fff"
          />
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.settingBtn}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={[styles.settingBtnText, { color: theme.text }]}>✎ Edit Profile & Preferences</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.settingBtn, styles.logoutBtn]}
          onPress={async () => {
            await logout();
          }}
        >
          <Text style={[styles.settingBtnText, { color: '#ef4444' }]}>
            Logout
          </Text>
        </TouchableOpacity>

      </ProfileSectionCard>

      {/* Username Modal */}
      <UsernameModal
        visible={usernameModalVisible}
        onClose={() => setUsernameModalVisible(false)}
        currentUsername={profile?.username}
        onSuccess={(newUsername) => {
          setProfile({
            ...profile,
            username: newUsername,
          });
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#111',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  username: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  email: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 13,
    color: '#111',
    marginBottom: 6,
    lineHeight: 20,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  settingBtn: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutBtn: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  settingBtnText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
});