import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  Modal, Image, Alert,
} from 'react-native';
import { getUserWardrobeItems } from '../../src/services/cloudWardrobeService';
import { getRecommendations, getItemCategory, getAIWeeklyPlan } from '../../src/services/recommendationService';
import { db, auth } from '../../src/services/firebaseConfig';
import { useTheme } from '../../src/context/ThemeContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const OCCASIONS = ['casual', 'office', 'smart-casual', 'formal', 'party', 'gym', 'date night'];
const OCCASION_COLORS = {
  'casual':       '#f0f0f0',
  'office':       '#dbeafe',
  'smart-casual': '#fef9c3',
  'formal':       '#ede9fe',
  'party':        '#fce7f3',
  'gym':          '#dcfce7',
  'date night':   '#fee2e2',
};
const OCCASION_TEXT = {
  'casual':       '#444',
  'office':       '#1d4ed8',
  'smart-casual': '#854d0e',
  'formal':       '#5b21b6',
  'party':        '#9d174d',
  'gym':          '#15803d',
  'date night':   '#b91c1c',
};

export default function Planner() {
  const { theme } = useTheme();
  const [wardrobe, setWardrobe] = useState([]);
  const [plan, setPlan] = useState({});
  const [occasions, setOccasions] = useState({
    Monday: 'casual', Tuesday: 'office', Wednesday: 'casual',
    Thursday: 'office', Friday: 'smart-casual', Saturday: 'casual', Sunday: 'casual',
  });
  const [loading, setLoading] = useState(false);
  const [generatingDay, setGeneratingDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [lockModal, setLockModal] = useState(false);
  const [lockedItems, setLockedItems] = useState({});

  useEffect(() => {
    loadWardrobe();
    loadSavedPlan();
  }, []);

  const loadWardrobe = async () => {
    try {
      const data = await getUserWardrobeItems();
      setWardrobe(data.items || []);
    } catch (e) {
      console.log('Wardrobe load error:', e);
    }
  };

  const loadSavedPlan = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const snap = await getDoc(doc(db, 'weekly_plans', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setPlan(data.plan || {});
        setOccasions(data.occasions || occasions);
        setLockedItems(data.lockedItems || {});
      }
    } catch (e) {
      console.log('Load plan error:', e);
    }
  };

  const savePlan = async (newPlan, newOccasions, newLocked) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, 'weekly_plans', user.uid), {
        plan: newPlan,
        occasions: newOccasions,
        lockedItems: newLocked,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.log('Save plan error:', e);
    }
  };

  const generateForDay = async (day) => {
  setGeneratingDay(day);
  try {
    const locked = lockedItems[day] || {};
    const result = await getRecommendations({
      occasion: occasions[day] || 'casual',
      temperatureC: 22,
      lockedTop:    locked.top    || null,
      lockedBottom: locked.bottom || null,
      lockedShoes:  locked.shoes  || null,
      wardrobe,
    });

    if (result.outfits && result.outfits.length > 0) {
      // Get IDs of outfits already planned for other days
      const usedCombos = new Set(
        Object.entries(plan)
          .filter(([d]) => d !== day)
          .map(([, o]) => `${o.top?.id}-${o.bottom?.id}-${o.shoes?.id}`)
      );

      let picked = result.outfits.find(o => {
        const key = `${o.top?.id}-${o.bottom?.id}-${o.shoes?.id}`;
        return !usedCombos.has(key);
      }) || result.outfits[0];

      const newPlan = { ...plan, [day]: picked };
      setPlan(newPlan);
      await savePlan(newPlan, occasions, lockedItems);
    }
  } catch (e) {
    Alert.alert('Error', 'Could not generate outfit for ' + day);
  }
  setGeneratingDay(null);
};

  const generateFullWeek = async () => {
  setLoading(true);
  const newPlan = { ...plan };

  try {
    const aiPlan = await getAIWeeklyPlan(wardrobe, occasions);
    if (aiPlan && typeof aiPlan === 'object' && Object.keys(aiPlan).length) {
      console.log('[planner] generateFullWeek: using backend weekly plan');
      // If the backend returns a week plan, use it
      for (const day of DAYS) {
        const dayItem = aiPlan[day];
        if (dayItem && dayItem.top && dayItem.bottom && dayItem.shoes) {
          newPlan[day] = dayItem;
        }
      }
      setPlan(newPlan);
      await savePlan(newPlan, occasions, lockedItems);
      setLoading(false);
      return;
    }
  } catch (e) {
    console.log('[planner] generateFullWeek: backend weekly plan failed, using local scoring', e);
  }

  // Using local scoring
  console.log('[planner] generateFullWeek: using local scoring');
  const usedCombos = new Set(); // track used combinations

  for (const day of DAYS) {
    try {
      const locked = lockedItems[day] || {};
      const result = await getRecommendations({
        occasion: occasions[day] || 'casual',
        temperatureC: 22,
        lockedTop:    locked.top    || null,
        lockedBottom: locked.bottom || null,
        lockedShoes:  locked.shoes  || null,
        wardrobe,
      });

      if (result.outfits && result.outfits.length > 0) {
        // Find outfits not already used this week
        const available = result.outfits.filter(o => {
          const key = `${o.top?.id}-${o.bottom?.id}-${o.shoes?.id}`;
          return !usedCombos.has(key);
        });
        // Pick random from available, or fallback to any
        const picked = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : result.outfits[Math.floor(Math.random() * result.outfits.length)];
        const key = `${picked.top?.id}-${picked.bottom?.id}-${picked.shoes?.id}`;
        usedCombos.add(key);
        newPlan[day] = picked;
      }
    } catch (e) {
      console.log('Error generating for', day, e);
    }
  }
  setPlan(newPlan);
  await savePlan(newPlan, occasions, lockedItems);
  setLoading(false);
};

  const setDayOccasion = async (day, occasion) => {
    const newOccasions = { ...occasions, [day]: occasion };
    setOccasions(newOccasions);
    await savePlan(plan, newOccasions, lockedItems);
  };

  const lockItemForDay = async (day, category, item) => {
    const newLocked = {
      ...lockedItems,
      [day]: { ...lockedItems[day], [category]: item },
    };
    setLockedItems(newLocked);
    await savePlan(plan, occasions, newLocked);
  };

  const unlockItemForDay = async (day, category) => {
    const newLocked = { ...lockedItems };
    if (newLocked[day]) {
      delete newLocked[day][category];
      if (Object.keys(newLocked[day]).length === 0) delete newLocked[day];
    }
    setLockedItems(newLocked);
    await savePlan(plan, occasions, newLocked);
  };

  const tops    = wardrobe.filter(i => getItemCategory(i) === 'top');
  const bottoms = wardrobe.filter(i => getItemCategory(i) === 'bottom');
  const shoes   = wardrobe.filter(i => getItemCategory(i) === 'shoes');

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: theme.text }]}>Weekly Planner</Text>
        <TouchableOpacity
          style={[s.generateAllBtn, { backgroundColor: theme.tint }]}
          onPress={generateFullWeek}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color={theme.bg} />
            : <Text style={[s.generateAllText, { color: theme.bg }]}>✦ Generate Week</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {DAYS.map((day, idx) => {
          const outfit = plan[day];
          const occasion = occasions[day] || 'casual';
          const isGenerating = generatingDay === day;
          const locked = lockedItems[day] || {};
          const hasLocked = Object.keys(locked).length > 0;

          return (
            <View key={day} style={[s.dayCard, { backgroundColor: theme.card }]}>
              {/* Day header */}
              <View style={s.dayHeader}>
                <View>
                  <Text style={[s.dayName, { color: theme.text }]}>{day}</Text>
                  <Text style={[s.dayShort, { color: theme.text2 }]}>{DAY_SHORT[idx]}</Text>
                </View>

                {/* Occasion pill */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.occasionScroll}>
                  {OCCASIONS.map(o => (
                    <TouchableOpacity
                      key={o}
                      style={[
                        s.occasionPill,
                        { backgroundColor: occasion === o ? OCCASION_COLORS[o] : theme.bg2, borderColor: theme.border }
                      ]}
                      onPress={() => setDayOccasion(day, o)}
                    >
                      <Text style={[
                        s.occasionPillText,
                        { color: occasion === o ? '#fff' : theme.text },
                      ]}>
                        {o}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Locked items indicator */}
              {hasLocked && (
                <View style={[s.lockedBar, { backgroundColor: theme.bg2 }]}>
                  <Text style={[s.lockedBarText, { color: theme.text2 }]}>
                    🔒 {Object.keys(locked).join(', ')} locked
                  </Text>
                  <TouchableOpacity onPress={() => { setSelectedDay(day); setLockModal(true); }}>
                    <Text style={[s.editLockedText, { color: theme.tint }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Outfit display */}
              {isGenerating ? (
                <View style={s.loadingBox}>
                  <ActivityIndicator color="#000" />
                  <Text style={[s.loadingText, { color: theme.text }]}>Generating outfit...</Text>
                </View>
              ) : outfit ? (
                <View style={s.outfitRow}>
                  {[
                    { label: 'Top',    item: outfit.top    || outfit.shirt },
                    { label: 'Bottom', item: outfit.bottom || outfit.pants },
                    { label: 'Shoes',  item: outfit.shoes },
                  ].map(({ label, item }) => (
                    <View key={label} style={s.outfitSlot}>
                      {item?.image ? (
                        <Image source={{ uri: item.image }} style={s.outfitImg} />
                      ) : (
                        <View style={[s.outfitPlaceholder, { backgroundColor: theme.bg2 }]}>
                          <Text style={{ fontSize: 20 }}>
                            {label === 'Top' ? '👕' : label === 'Bottom' ? '👖' : '👟'}
                          </Text>
                        </View>
                      )}
                      <Text style={[s.outfitSlotLabel, { color: theme.text2 }]}>{label}</Text>
                    </View>
                  ))}

                  {/* Score */}
                  <View style={s.scoreBox}>
                    <Text style={[s.scoreNum, { color: theme.text }]}>{outfit.score?.total?.toFixed(1)}</Text>
                    <Text style={[s.scoreLabel, { color: theme.text2 }]}>/10</Text>
                  </View>
                </View>
              ) : (
                <View style={s.emptyOutfit}>
                  <Text style={[s.emptyText, { color: theme.text2 }]}>No outfit yet</Text>
                </View>
              )}

              {/* Action buttons */}
              <View style={s.dayActions}>
                <TouchableOpacity
                  style={[s.regenBtn, { backgroundColor: theme.bg2 }]}
                  onPress={() => generateForDay(day)}
                  disabled={isGenerating}
                >
                  <Text style={[s.regenBtnText, { color: theme.text }]}>↺ Regenerate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.lockBtn, { backgroundColor: theme.tint }]}
                  onPress={() => { setSelectedDay(day); setLockModal(true); }}
                >
                  <Text style={[s.lockBtnText, { color: theme.bg }]}>🔒 Lock item</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Lock Item Modal */}
      <Modal visible={lockModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[s.modalTitle, { color: theme.text }]}>Lock item for {selectedDay}</Text>
            <Text style={[s.modalSub, { color: theme.text2 }]}>Tap an item to lock it for this day. Tap again to unlock.</Text>

            {[
              { label: 'Tops',    items: tops,    cat: 'top' },
              { label: 'Bottoms', items: bottoms, cat: 'bottom' },
              { label: 'Shoes',   items: shoes,   cat: 'shoes' },
            ].map(group => (
              <View key={group.cat}>
                <Text style={[s.groupLabel, { color: theme.text }]}>{group.label}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {group.items.length === 0 ? (
                    <Text style={[s.emptyGroup, { color: theme.text2 }]}>None in wardrobe</Text>
                  ) : group.items.map(item => {
                    const isLocked = lockedItems[selectedDay]?.[group.cat]?.id === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[s.lockItemCard, isLocked && s.lockItemCardActive]}
                        onPress={() => {
                          if (isLocked) unlockItemForDay(selectedDay, group.cat);
                          else lockItemForDay(selectedDay, group.cat, item);
                        }}
                      >
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={s.lockItemImg} />
                        ) : (
                          <View style={[s.lockItemImg, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 20 }}>
                              {group.cat === 'top' ? '👕' : group.cat === 'bottom' ? '👖' : '👟'}
                            </Text>
                          </View>
                        )}
                        {isLocked && <Text style={s.lockBadge}>🔒</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}

            <TouchableOpacity style={[s.closeModalBtn, { backgroundColor: theme.tint }]} onPress={() => setLockModal(false)}>
              <Text style={[s.closeModalText, { color: theme.bg }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1 },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  title:             { fontSize: 24, fontWeight: '600' },
  generateAllBtn:    { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  generateAllText:   { fontWeight: '600', fontSize: 13 },
  dayCard:           { margin: 12, marginBottom: 4, borderRadius: 16, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  dayHeader:         { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  dayName:           { fontSize: 15, fontWeight: '700', width: 75 },
  dayShort:          { fontSize: 11, marginTop: 1 },
  occasionScroll:    { flex: 1 },
  occasionPill:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 6, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#e0e0e0' },
  occasionPillText:  { fontSize: 11, fontWeight: '600', color: '#555' },
  lockedBar:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6 },
  lockedBarText:     { fontSize: 12 },
  editLockedText:    { fontSize: 12, fontWeight: '600' },
  outfitRow:         { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  outfitSlot:        { alignItems: 'center', flex: 1 },
  outfitImg:         { width: 72, height: 88, borderRadius: 10 },
  outfitPlaceholder: { width: 72, height: 88, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  outfitSlotLabel:   { fontSize: 10, marginTop: 4 },
  scoreBox:          { alignItems: 'center', paddingHorizontal: 8 },
  scoreNum:          { fontSize: 20, fontWeight: '700' },
  scoreLabel:        { fontSize: 11 },
  emptyOutfit:       { alignItems: 'center', padding: 20 },
  emptyText:         { color: '#ccc', fontSize: 13 },
  loadingBox:        { alignItems: 'center', padding: 20, gap: 8 },
  loadingText:       { fontSize: 12 },
  dayActions:        { flexDirection: 'row', borderTopWidth: 1 },
  regenBtn:          { flex: 1, padding: 12, alignItems: 'center', borderRightWidth: 1 },
  regenBtnText:      { fontSize: 13, fontWeight: '600' },
  lockBtn:           { flex: 1, padding: 12, alignItems: 'center' },
  lockBtnText:       { fontSize: 13, fontWeight: '600' },
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard:         { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '75%' },
  modalTitle:        { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  modalSub:          { fontSize: 12, marginBottom: 16 },
  groupLabel:        { fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  emptyGroup:        { fontSize: 12, padding: 8 },
  lockItemCard:      { width: 72, height: 80, borderRadius: 10, borderWidth: 1.5, marginRight: 8, overflow: 'visible' },
  lockItemCardActive:{ borderWidth: 2.5 },
  lockItemImg:       { width: 68, height: 76, borderRadius: 8 },
  lockBadge:         { position: 'absolute', top: -8, right: -8, fontSize: 14 },
  closeModalBtn:     { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  closeModalText:    { fontWeight: '600', fontSize: 15 },
});