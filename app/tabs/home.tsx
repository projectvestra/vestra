type WardrobeItem = {
  id: string;
  image: string;
  name: string;
  category: string;
  color: string;
  size?: string;
  fit?: string;
};

import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import GreetingSection from '../../src/components/home/GreetingSection';
import TodayOutfitCard from '../../src/components/home/TodayOutfitCard';
import QuickActionCard from '../../src/components/home/QuickActionCard';
import WeeklyPreview from '../../src/components/home/WeeklyPreview';

import {
  getHomeSummary,
  getTodayOutfit,
  getWeeklyPreview,
} from '../../src/services/homeService';

import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const [summary, setSummary] = useState<{
  totalItems: number;
  recentItem: WardrobeItem | null;
}>({
  totalItems: 0,
  recentItem: null,
});

  const [outfit, setOutfit] = useState({});
 const [weekly, setWeekly] = useState<
  { day: string; tag: string }[]
>([]);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    const summaryData = await getHomeSummary();
    const outfitData = await getTodayOutfit();
    const weeklyData = await getWeeklyPreview();

    setSummary(summaryData);
    setOutfit(outfitData);
    setWeekly(weeklyData);
  } catch (error) {
    console.log('Home load error:', error);
  }
};

  return (
    <ScrollView style={styles.container}>
      <GreetingSection
        name="Arnav"
        totalItems={summary.totalItems}
        recentItem={summary.recentItem}
      />

      <TodayOutfitCard outfit={outfit} />

      <View style={{ marginTop: 24 }}>
        <QuickActionCard
          title="Plan Weekly Outfits"
          onPress={() => router.push('./planner')}
        />
        <QuickActionCard
          title="View Wardrobe"
          onPress={() => router.push('/tabs/wardrobe')}
        />
        <QuickActionCard
          title="Explore Trends"
          onPress={() => router.push('/tabs/explore')}
        />
      </View>

      <WeeklyPreview weeklyData={weekly} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
});
