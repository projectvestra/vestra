import { View, StyleSheet, ScrollView } from 'react-native';
import { getTodayOutfit, getWeeklyPlan } from '../../src/services/homeService';
import TodayOutfitCard from '../../src/components/TodayOutfitCard';
import ActionCard from '../../src/components/ActionCard';
import SectionHeader from '../../src/components/SectionHeader';


export default function Home() {
  const todayOutfit = getTodayOutfit();
  const weeklyPlan = getWeeklyPlan(); // unused for now (future)

  return (
    <ScrollView style={styles.container}>
      {/* Mannequin / Placeholder */}
      <View style={styles.mannequinPlaceholder} />

      {/* Today’s Outfit */}
      <SectionHeader title="Today’s Look" />
<TodayOutfitCard outfit={todayOutfit} />

<SectionHeader title="Quick Actions" />
<ActionCard title="Today’s Outfit" />
<ActionCard title="Outfit Planner" />
<ActionCard title="Weekly Planner" />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  mannequinPlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#eaeaea',
    marginBottom: 24,
  },
});
