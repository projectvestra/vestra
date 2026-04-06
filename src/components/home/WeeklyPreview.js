import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

const OCCASION_COLORS = {
  'casual':       '#f0f0f0',
  'office':       '#dbeafe',
  'smart-casual': '#fef9c3',
  'formal':       '#ede9fe',
  'party':        '#fce7f3',
  'gym':          '#dcfce7',
  'date night':   '#fee2e2',
};

/**
 * @param {{weeklyData?: Array<{day:string,tag:string}>, planData?: Record<string, any>}} props
 */
export default function WeeklyPreview({ weeklyData = [], planData = {} }) {
  const router = useRouter();
  const { theme } = useTheme();

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (!weeklyData || weeklyData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg2 }]}> 
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Weekly Preview</Text>
          <TouchableOpacity onPress={() => router.push('/tabs/planner')}>
            <Text style={[styles.seeAll, { color: theme.tint }]}>Plan Week →</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.emptyCard, { backgroundColor: theme.bg }]}> 
          <Text style={[styles.emptyText, { color: theme.text2 }]}>No weekly outfits generated yet.</Text>
          <Text style={[styles.emptySub, { color: theme.icon }]}>Open Planner and generate your week to see outfit suggestions here.</Text>
          <TouchableOpacity
            style={[styles.generateBtn, { backgroundColor: theme.tint }]}
            onPress={() => router.push('/tabs/planner')}
          >
            <Text style={styles.generateBtnText}>Open Planner</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg2 }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>This Week</Text>
        <TouchableOpacity onPress={() => router.push('/tabs/planner')}>
          <Text style={[styles.seeAll, { color: theme.tint }]}>Plan Week →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((day, idx) => {
          const fullDay = fullDays[idx];
          const outfit = planData[fullDay];
          const weekItem = weeklyData[idx];
          const occasion = weekItem?.occasion || weekItem?.tag?.toLowerCase() || 'casual';
          const bgColor = OCCASION_COLORS[occasion] || '#f0f0f0';

          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayCard, { backgroundColor: bgColor }]}
              onPress={() => router.push('/tabs/planner')}
            >
              <Text style={styles.dayLabel}>{day}</Text>

              {outfit ? (
                <View style={styles.outfitMini}>
                  {[outfit.top || outfit.shirt, outfit.bottom || outfit.pants].map((item, j) => (
                    item?.image ? (
                      <Image key={j} source={{ uri: item.image }} style={styles.miniImg} />
                    ) : (
                      <View key={j} style={[styles.miniImg, { backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 12 }}>{j === 0 ? '👕' : '👖'}</Text>
                      </View>
                    )
                  ))}
                </View>
              ) : (
                <View style={styles.emptyMini}>
                  <Text style={styles.emptyMiniText}>+</Text>
                </View>
              )}

              <Text style={styles.occasionTag} numberOfLines={1}>
                {occasion}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { marginTop: 24 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title:         { fontSize: 17, fontWeight: '600' },
  seeAll:        { fontSize: 13, color: '#0a7ea4', fontWeight: '500' },
  dayCard:       { width: 80, marginRight: 10, borderRadius: 14, padding: 10, alignItems: 'center' },
  dayLabel:      { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 6 },
  outfitMini:    { flexDirection: 'row', gap: 2, marginBottom: 6 },
  miniImg:       { width: 28, height: 34, borderRadius: 6 },
  emptyMini:     { width: 60, height: 34, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyMiniText: { fontSize: 18, color: '#999' },
  occasionTag:   { fontSize: 9, color: '#555', fontWeight: '600', textAlign: 'center' },
  emptyCard:     { padding: 18, borderRadius: 18, marginTop: 6, borderWidth: 1, borderColor: '#e0e0e0' },
  emptyText:     { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  emptySub:      { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  generateBtn:   { paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  generateBtnText:{ color: '#fff', fontWeight: '700' },
});