import {
  ScrollView, View, Text, StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo, useCallback } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getUserProfile } from "../../src/services/userService";
import { auth } from "../../src/services/firebaseConfig";
import ProfileSectionCard from "../../src/components/ProfileSectionCard";
import ProfileStatCard from "../../src/components/ProfileStatCard";
import { getUserWardrobeItems } from "../../src/services/cloudWardrobeService";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { ui } from '../../src/theme/ui';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerText, setBannerText] = useState('');
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

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
            photoUrl: preferences?.photoUrl || '',
            bannerImageUrl: preferences?.bannerImageUrl || '',
          });
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      };
      loadProfile();
      if (params.toast === 'profile-saved') {
        setBannerText('✨ Profile updated successfully');
        const timer = setTimeout(() => setBannerText(''), 1800);
        return () => clearTimeout(timer);
      }
    }, [params.toast])
  );

  /* Load Wardrobe */
  useFocusEffect(
    useCallback(() => {
      const loadWardrobe = async () => {
        try {
          const data = await getUserWardrobeItems();
          setWardrobeItems(data?.items || []);
        } catch {
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
      {bannerText ? (
        <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.bannerText, { color: theme.text }]}>{bannerText}</Text>
        </View>
      ) : null}

      {/* HEADER */}
      <View style={[styles.headerCard, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
        {profile?.bannerImageUrl ? (
          <Image source={{ uri: profile.bannerImageUrl }} style={styles.bannerImage} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={theme.bg === '#0b0c0f' ? ['#0d1017', '#161a24', '#1d2430'] : ['#ffffff', '#f7f7f4', '#ecece6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerFallback}
          />
        )}

        <TouchableOpacity style={styles.settingsGearBtn} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsGearText}>⚙️</Text>
        </TouchableOpacity>

        <View style={styles.profileMetaArea}>
          <View style={styles.avatar}>
            {profile?.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>

          {profile?.username ? (
            <Text style={[styles.username, { color: theme.icon }]}>@{profile.username}</Text>
          ) : null}
          <Text style={[styles.name, { color: theme.text }]}>{profile?.name || 'Loading...'}</Text>
          <Text style={[styles.email, { color: theme.icon }]}>{profile?.email}</Text>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.tint }]}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.86}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    borderRadius: ui.radius.xl,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 10,
    borderWidth: 1,
    ...ui.shadow.card,
  },
  bannerImage: {
    width: '100%',
    height: 128,
  },
  bannerFallback: {
    width: '100%',
    height: 128,
    backgroundColor: '#dbeafe',
  },
  profileMetaArea: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 18,
    marginTop: -44,
  },
  settingsGearBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(12,14,18,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGearText: {
    fontSize: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2b2f36',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  username: {
    fontSize: 13,
    color: '#7a8392',
    marginBottom: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#121214',
  },
  email: {
    fontSize: 13,
    color: '#7a8392',
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: ui.radius.pill,
  },
  editText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 13,
    color: '#121214',
    marginBottom: 6,
    lineHeight: 20,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  banner: {
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: ui.radius.md,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '500',
  },
});