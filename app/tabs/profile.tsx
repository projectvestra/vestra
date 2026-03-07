import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { useState, useMemo, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import { fetchWardrobeItems } from "../../src/services/wardrobeService";
import { getPreferences } from "../../src/services/userPreferencesService";
import { auth } from "../../src/services/firebaseConfig";

import ProfileSectionCard from "../../src/components/ProfileSectionCard";
import ProfileStatCard from "../../src/components/ProfileStatCard";
import SettingsRow from "../../src/components/SettingsRow";

import { Colors } from "../../constants/theme";
import { logout } from "../../src/services/authService";
export default function Profile() {

  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------
     Load Profile Data
  --------------------------------*/
  useFocusEffect(
  useCallback(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;
        const preferences = await getPreferences();

        setProfile({
          name: user?.displayName || "User",
          email: user?.email || "",
          height: preferences?.height || "",
          bodyType: preferences?.bodyType || "",
          styles: preferences?.styles || [],
          colors: preferences?.preferredColors || [],
          constraints: preferences?.constraints || [],
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [])
);

  /* -------------------------------
     Load Wardrobe
  --------------------------------*/
 useFocusEffect(
  useCallback(() => {
    const loadWardrobe = async () => {
      try {
        const data = await fetchWardrobeItems();

        if (data?.items) {
          setWardrobeItems(data.items);
        } else if (Array.isArray(data)) {
          setWardrobeItems(data);
        } else {
          setWardrobeItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch wardrobe items:", error);
        setWardrobeItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWardrobe();
  }, [])
);

  /* -------------------------------
     Wardrobe Stats
  --------------------------------*/
  const stats = useMemo(() => {
    const breakdown: Record<string, number> = {
      Shirts: 0,
      Pants: 0,
      Shoes: 0,
      Accessories: 0,
    };

    wardrobeItems.forEach((item: any) => {
      const category = item?.category;
      if (category && breakdown[category] !== undefined) {
        breakdown[category]++;
      }
    });

    return {
      total: wardrobeItems.length,
      breakdown,
    };
  }, [wardrobeItems]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar} />

        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* STYLE IDENTITY */}
      <ProfileSectionCard title="Style Identity">
        <Text style={styles.metaText}>
          Preferred Styles: {profile?.styles?.join(', ') || '—'}
        </Text>

        <Text style={styles.metaText}>
          Colors: {profile?.colors?.join(', ') || '—'}
        </Text>

        <Text style={styles.metaText}>
          Body Type: {profile?.bodyType || '—'}
        </Text>

        <Text style={styles.metaText}>
          Height: {profile?.height ? `${profile.height} cm` : '—'}
        </Text>

        <Text style={styles.metaText}>
          Constraints: {profile?.constraints?.length
  ? profile.constraints.join(", ")
  : "None"}
        </Text>
      </ProfileSectionCard>

      {/* WARDROBE INSIGHTS */}
      <ProfileSectionCard title="Wardrobe Insights">
        {loading ? (
          <Text style={styles.metaText}>Loading wardrobe...</Text>
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

      {/* ACTIVITY */}
      <ProfileSectionCard title="Activity">
        <Text style={styles.metaText}>
          Recently Added: Black Oversized Tee
        </Text>

        <Text style={styles.metaText}>
          Last Outfit Generated: Street Casual Fit
        </Text>

        <Text style={styles.metaText}>
          Saved Looks - TO BE ADDED
        </Text>
      </ProfileSectionCard>

      {/* WISHLIST */}
      <ProfileSectionCard title="Wishlist">
        <FlatList
          horizontal
          data={[1, 2, 3]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <View style={styles.wishlistCard} />}
          showsHorizontalScrollIndicator={false}
        />
      </ProfileSectionCard>

      {/* SETTINGS */}
      <ProfileSectionCard title="Settings">
        <SettingsRow label="Notifications" />
        <SettingsRow label="Dark Mode" />
        <SettingsRow label="Privacy" />
        <SettingsRow
          label="Logout"
          onPress={async () => {
            await logout();
          }}
        />
      </ProfileSectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e5e5',
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },

  email: {
    fontSize: 13,
    color: Colors.light.icon,
    marginTop: 4,
  },

  editButton: {
    marginTop: 12,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 18,
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
    color: Colors.light.text,
    marginBottom: 6,
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  wishlistCard: {
    width: 120,
    height: 120,
    backgroundColor: '#eaeaea',
    borderRadius: 12,
    marginRight: 12,
  },
});