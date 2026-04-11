import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet, View, Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GreetingSection from '../../src/components/home/GreetingSection';
import TodayOutfitCard from '../../src/components/home/TodayOutfitCard';
import WeeklyPreview from '../../src/components/home/WeeklyPreview';
import StyleAssistantModal from '../../src/components/home/StyleAssistantModal';
import {
  getHomeSummary,
  getTodayOutfit,
  getWeeklyPreview,
} from '../../src/services/homeService';
import { getUserWardrobeItems } from '../../src/services/cloudWardrobeService';
import { useTheme } from '../../src/context/ThemeContext';
import { ui } from '../../src/theme/ui';

type WardrobeItem = {
  id: string;
  image: string;
  name: string;
  category: string;
  color: string;
  size?: string;
  fit?: string;
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [summary, setSummary] = useState<{
    totalItems: number;
    recentItem: WardrobeItem | null;
  }>({ totalItems: 0, recentItem: null });

  const [outfit, setOutfit] = useState({});
  const [weekly, setWeekly] = useState<{ day: string; tag: string }[]>([]);
  const [planData, setPlanData] = useState<Record<string, any>>({});
  const [showAssistant, setShowAssistant] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [summaryData, outfitData, weeklyPreview, wardrobeData] = await Promise.all([
        getHomeSummary(),
        getTodayOutfit(),
        getWeeklyPreview(),
        getUserWardrobeItems(),
      ]);
      setSummary(summaryData);
      setOutfit(outfitData);
      setWeekly(weeklyPreview.weeklyData || []);
      setPlanData(weeklyPreview.planData || {});
      setWardrobeItems(wardrobeData?.items || []);
    } catch (error) {
      console.log('Home load error:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return undefined;
    }, [loadData])
  );

  const quickActions = [
    {
      icon: '✦',
      label: 'Style Assistant',
      subtitle: 'Generate an outfit',
      onPress: () => setShowAssistant(true),
      highlight: true,
    },
    {
      icon: '📅',
      label: 'Weekly Planner',
      subtitle: 'Plan your week',
      onPress: () => router.push('/tabs/planner'),
    },
    {
      icon: '👗',
      label: 'My Wardrobe',
      subtitle: 'View all items',
      onPress: () => router.push('/tabs/wardrobe'),
    },
    {
      icon: '🔍',
      label: 'Explore Trends',
      subtitle: "See what's new",
      onPress: () => router.push('/tabs/explore'),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <GreetingSection
        totalItems={summary.totalItems}
        recentItem={summary.recentItem}
      />

      <TodayOutfitCard outfit={outfit} />

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        {quickActions.map((action, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.actionCard,
              {
                backgroundColor: action.highlight ? theme.tint : theme.bg2,
                borderColor: theme.border,
                shadowColor: action.highlight ? theme.tint : '#000',
              },
            ]}
            onPress={action.onPress}
            activeOpacity={0.84}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={[
              styles.actionLabel,
              { color: action.highlight ? theme.bg : theme.text },
            ]}>
              {action.label}
            </Text>
            <Text style={[
              styles.actionSub,
              { color: action.highlight ? 'rgba(255,255,255,0.82)' : theme.text2 },
            ]}>
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <WeeklyPreview weeklyData={weekly} planData={planData} />

      <StyleAssistantModal
        visible={showAssistant}
        onClose={() => setShowAssistant(false)}
        wardrobe={wardrobeItems}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: ui.type.section, fontWeight: '800',
    marginTop: ui.spacing.xl, marginBottom: ui.spacing.sm,
    letterSpacing: -0.2,
  },
  actionGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  actionCard: {
    width: '47%', borderRadius: ui.radius.lg, padding: 16,
    borderWidth: 1, borderColor: 'transparent',
    ...ui.shadow.card,
  },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  actionSub: { fontSize: 12, lineHeight: 17 },
});