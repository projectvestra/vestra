import {
  ScrollView, View, Text, StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getUserProfile } from "../../src/services/userService";
import { auth } from "../../src/services/firebaseConfig";
import ProfileSectionCard from "../../src/components/ProfileSectionCard";
import ProfileStatCard from "../../src/components/ProfileStatCard";
import { getUserWardrobeItems } from "../../src/services/cloudWardrobeService";
import { getProfileStyleSummary } from '../../src/services/profileSummaryService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { ui } from '../../src/theme/ui';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerText, setBannerText] = useState('');
  const [aiSignatureSummary, setAiSignatureSummary] = useState('');
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const summaryRequestRef = useRef(0);
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSummaryKeyRef = useRef('');

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  /* Load Profile */
  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const user = auth.currentUser;
          const preferences = await getUserProfile();

          setProfile({
            name: user?.displayName
              ? user.displayName
              : user?.email?.split('@')[0] || 'User',
            email: user?.email || '',
            pronouns: preferences?.pronouns || '',
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
        router.setParams({ toast: undefined });
        bannerOpacity.setValue(0);
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();

        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => {
          Animated.timing(bannerOpacity, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }).start(() => setBannerText(''));
        }, 2200);
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

  const identityHighlights = useMemo(() => {
    const stylesList = Array.isArray(profile?.styles) ? profile.styles : [];
    const colorsList = Array.isArray(profile?.colors) ? profile.colors : [];
    return {
      styleTags: stylesList.slice(0, 4),
      colorTags: colorsList.slice(0, 4),
    };
  }, [profile, wardrobeItems]);

  const localSignatureSummary = useMemo(() => {
    const stylesList = Array.isArray(profile?.styles) ? profile.styles : [];
    const colorsList = Array.isArray(profile?.colors) ? profile.colors : [];
    const bodyType = profile?.bodyType || '';

    if (!stylesList.length && !colorsList.length && !bodyType) {
      return 'Add your style tags, colors, and body type to generate a short style summary.';
    }

    const styleText = stylesList.slice(0, 2).join(', ') || 'clean silhouettes';
    const colorText = colorsList.slice(0, 2).join(', ') || 'balanced neutrals';
    const fitText = bodyType || 'balanced';
    return `Prefers ${styleText.toLowerCase()} with a ${fitText.toLowerCase()} shape profile, and leans toward ${colorText.toLowerCase()} for a cohesive wardrobe.`;
  }, [profile?.styles, profile?.colors, profile?.bodyType, profile?.pronouns]);

  useEffect(() => {
    const stylesList = Array.isArray(profile?.styles) ? profile.styles : [];
    const colorsList = Array.isArray(profile?.colors) ? profile.colors : [];
    const bodyType = profile?.bodyType || '';
    const pronouns = profile?.pronouns || '';
    const summaryKey = JSON.stringify({
      styles: stylesList,
      colors: colorsList,
      bodyType,
      pronouns,
    });

    if (summaryKey === lastSummaryKeyRef.current && aiSignatureSummary.trim()) {
      return;
    }
    lastSummaryKeyRef.current = summaryKey;

    if (!stylesList.length && !colorsList.length && !bodyType) {
      setAiSignatureSummary('');
      return;
    }

    setAiSignatureSummary('');

    const requestId = ++summaryRequestRef.current;
    let isActive = true;

    getProfileStyleSummary({
      styles: stylesList,
      colors: colorsList,
      bodyType,
      pronouns,
    }).then((result) => {
      if (!isActive || requestId !== summaryRequestRef.current) return;
      const next = (result?.summary || '').trim();
      setAiSignatureSummary(next);
    });

    return () => {
      isActive = false;
    };
  }, [profile?.styles, profile?.colors, profile?.bodyType, profile?.pronouns, aiSignatureSummary]);

  const wardrobeInsights = useMemo(() => {
    const categories = [
      { key: 'Shirts', label: 'Shirts' },
      { key: 'Pants', label: 'Pants' },
      { key: 'Shoes', label: 'Shoes' },
      { key: 'Accessories', label: 'Accessories' },
      { key: 'Jackets', label: 'Jackets' },
    ];
    const counts = categories.map(c => stats.breakdown[c.key] || 0);
    const coveredCounts = counts.filter(c => c > 0);
    const coveredCount = coveredCounts.length;
    const coverageRatio = coveredCount / categories.length;
    const mean = coveredCounts.length ? coveredCounts.reduce((a, b) => a + b, 0) / coveredCounts.length : 0;
    const variance = coveredCounts.length ? coveredCounts.reduce((acc, v) => acc + ((v - mean) ** 2), 0) / coveredCounts.length : 0;
    const stdDev = Math.sqrt(variance);
    const evenness = mean > 0 ? Math.max(0, 1 - (stdDev / (mean + 1))) : 0;
    const balanceScore = stats.total === 0 ? 0 : Math.round((coverageRatio * 60) + (evenness * 40));
    const missing = categories.filter(c => (stats.breakdown[c.key] || 0) === 0).map(c => c.label);
    const dominantCategory = categories
      .map(category => ({ ...category, count: stats.breakdown[category.key] || 0 }))
      .sort((a, b) => b.count - a.count)[0];
    const fitCounts: Record<string, number> = {};
    wardrobeItems.forEach((item: any) => {
      const fit = item?.fit;
      if (fit) fitCounts[fit] = (fitCounts[fit] || 0) + 1;
    });
    const dominantFit = Object.entries(fitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed fit';
    const wardrobeBrief = stats.total === 0
      ? 'Add a few pieces to unlock a stronger style brief.'
      : `${dominantCategory?.label || 'Your wardrobe'} leads the rack, with ${dominantFit.toLowerCase()} energy and ${coverageRatio >= 0.8 ? 'strong' : 'growing'} category balance.`;
    return {
      coveredCount,
      balanceScore,
      wardrobeBrief,
      missingText: missing.length ? `Add ${missing.slice(0, 2).join(' + ')} next for better outfit range.` : 'Strong category spread. Keep rotating statement pieces.',
    };
  }, [stats, wardrobeItems]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingBottom: 40, paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {bannerText ? (
        <Animated.View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.border, opacity: bannerOpacity }]}>
          <Text style={[styles.bannerText, { color: theme.text }]}>{bannerText}</Text>
        </Animated.View>
      ) : null}

      {/* USERNAME + SETTINGS ROW */}
      <View style={[styles.usernameRow, { marginBottom: 12 }]}>
        {profile?.username ? (
          <Text style={[styles.usernameTopLeft, { color: theme.text }]}>@{profile.username}</Text>
        ) : (
          <View style={{ width: 100 }} />
        )}
        <TouchableOpacity style={styles.settingsGearTopRight} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsGearTextTopRight}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* HEADER */}
      <View style={[styles.headerCard, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
        <View style={styles.bannerShell}>
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

          <LinearGradient
            colors={['rgba(8,10,14,0.02)', 'rgba(8,10,14,0.38)', 'rgba(8,10,14,0.72)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.bannerOverlay}
          />

          <View style={styles.heroContentRow}>
            <View style={styles.avatar}>
              {profile?.photoUrl ? (
                <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>
                  {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              )}
            </View>

            <View style={styles.heroTextBlock}>
              {profile?.pronouns ? (
                <Text style={styles.heroPronouns} numberOfLines={1}>{profile.pronouns}</Text>
              ) : null}
              <Text style={styles.heroName} numberOfLines={1}>{profile?.name || 'Loading...'}</Text>
              <Text style={styles.heroEmail} numberOfLines={1}>{profile?.email}</Text>
            </View>
          </View>
        </View>

      </View>

      <TouchableOpacity
        style={[styles.editButton, styles.editButtonStandalone, { backgroundColor: theme.tint }]}
        onPress={() => router.push('/edit-profile')}
        activeOpacity={0.86}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* STYLE IDENTITY */}
      <ProfileSectionCard title="Style Identity">
        <View style={[styles.identityPill, { backgroundColor: theme.bg3, borderColor: theme.border }]}> 
          <Text style={[styles.identityTitle, { color: theme.text }]}>Signature Vibe</Text>
          <Text style={[styles.identityBody, { color: theme.text2 }]}>
            {aiSignatureSummary || localSignatureSummary}
          </Text>
        </View>

        <Text style={[styles.metaHeading, { color: theme.text2 }]}>Style Tags</Text>
        <View style={styles.tagWrap}>
          {identityHighlights.styleTags.length ? identityHighlights.styleTags.map((tag: string) => (
            <View key={`style-${tag}`} style={[styles.tagChip, { backgroundColor: theme.bg3, borderColor: theme.border }]}>
              <Text style={[styles.tagChipText, { color: theme.text }]}>{tag}</Text>
            </View>
          )) : <Text style={[styles.metaText, { color: theme.text2 }]}>No style tags yet</Text>}
        </View>

        <Text style={[styles.metaHeading, { color: theme.text2 }]}>Color Direction</Text>
        <View style={styles.tagWrap}>
          {identityHighlights.colorTags.length ? identityHighlights.colorTags.map((tag: string) => (
            <View key={`color-${tag}`} style={[styles.tagChip, { backgroundColor: theme.bg3, borderColor: theme.border }]}>
              <Text style={[styles.tagChipText, { color: theme.text }]}>{tag}</Text>
            </View>
          )) : <Text style={[styles.metaText, { color: theme.text2 }]}>No color preferences yet</Text>}
        </View>

        <Text style={[styles.metaHeading, { color: theme.text2 }]}>Body Type</Text>
        <View style={styles.tagWrap}>
          {profile?.bodyType ? (
            <View style={[styles.tagChip, { backgroundColor: theme.bg3, borderColor: theme.border }]}>
              <Text style={[styles.tagChipText, { color: theme.text }]}>{profile.bodyType}</Text>
            </View>
          ) : <Text style={[styles.metaText, { color: theme.text2 }]}>No body type selected yet</Text>}
        </View>

        <Text style={[styles.metaText, { color: theme.text2 }]}>Height: {profile?.height ? `${profile.height} cm` : '—'}</Text>
      </ProfileSectionCard>

      {/* WARDROBE INSIGHTS */}
      <ProfileSectionCard title="Wardrobe Insights">
        {loading ? (
          <Text style={[styles.metaText, { color: theme.text }]}>Loading wardrobe...</Text>
        ) : (
          <>
            <View style={[styles.identityPill, { backgroundColor: theme.bg3, borderColor: theme.border }]}> 
              <Text style={[styles.identityTitle, { color: theme.text }]}>Wardrobe Balance Score: {wardrobeInsights.balanceScore}</Text>
              <Text style={[styles.identityBody, { color: theme.text2 }]}> 
                {wardrobeInsights.wardrobeBrief} {wardrobeInsights.missingText}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statRow}
            >
              <ProfileStatCard value={stats.total} label="Total Items" />
              <ProfileStatCard value={stats.breakdown.Shirts} label="Shirts" />
              <ProfileStatCard value={stats.breakdown.Pants} label="Pants" />
              <ProfileStatCard value={stats.breakdown.Shoes} label="Shoes" />
              <ProfileStatCard value={stats.breakdown.Accessories} label="Accessories" />
            </ScrollView>
          </>
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
    height: '100%',
  },
  bannerFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#dbeafe',
  },
  bannerShell: {
    width: '100%',
    height: 228,
    position: 'relative',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  usernameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  usernameTopLeft: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  settingsGearTopRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGearTextTopRight: {
    fontSize: 18,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#2b2f36',
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
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
  heroContentRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextBlock: {
    marginLeft: 10,
    flex: 1,
  },
  heroUsername: {
    fontSize: 12,
    color: '#dbe3f3',
    marginBottom: 2,
    fontWeight: '600',
  },
  heroName: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '800',
    lineHeight: 26,
  },
  heroPronouns: {
    fontSize: 11,
    color: '#dbe3f3',
    fontWeight: '600',
    marginBottom: 2,
  },
  heroEmail: {
    marginTop: 2,
    color: '#d1d9e6',
    fontSize: 12,
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
    marginTop: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: ui.radius.pill,
    alignSelf: 'center',
  },
  editButtonStandalone: {
    marginBottom: 8,
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 13,
    color: '#121214',
    marginBottom: 6,
    lineHeight: 20,
  },
  metaHeading: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  identityPill: {
    borderRadius: ui.radius.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  identityTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  identityBody: {
    fontSize: 13,
    lineHeight: 21,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: ui.radius.pill,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statRow: {
    paddingRight: 6,
    gap: 8,
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