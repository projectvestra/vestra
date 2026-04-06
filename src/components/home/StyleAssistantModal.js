import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  PanResponder, Animated, Dimensions, ActivityIndicator,
  Image, ScrollView, Linking, Switch,
} from 'react-native';
import { db, auth } from '../../services/firebaseConfig';
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, serverTimestamp,
} from 'firebase/firestore';
import { getUserWardrobeItems } from '../../services/cloudWardrobeService';
import { getRecommendations, getItemCategory } from '../../services/recommendationService';
import { searchProductsOnline } from '../../services/shopSearchService';
import { useTheme } from '../../context/ThemeContext';

const { width: W } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const OCCASIONS = ['casual', 'office', 'date night', 'party', 'gym', 'shopping'];

// ── Firebase helpers for persisting outfits ──────────────────────────────────

async function saveOutfitToFirebase(outfit, type) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const ref = await addDoc(collection(db, 'saved_outfits'), {
      userId: user.uid,
      type, // 'saved' | 'favourite' | 'discarded'
      outfit: JSON.stringify(outfit),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.log('Save outfit error:', e);
    return null;
  }
}

async function removeOutfitFromFirebase(docId) {
  try {
    await deleteDoc(doc(db, 'saved_outfits', docId));
  } catch (e) {
    console.log('Remove outfit error:', e);
  }
}

async function fetchOutfitsFromFirebase(type) {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const q = query(
      collection(db, 'saved_outfits'),
      where('userId', '==', user.uid),
      where('type', '==', type)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      docId: d.id,
      ...JSON.parse(d.data().outfit),
    }));
  } catch (e) {
    console.log('Fetch outfits error:', e);
    return [];
  }
}

// ── Category helpers ──────────────────────────────────────────────────────────

function isWinterItem(item) {
  const cat = (item.category || item.name || '').toLowerCase();
  return cat.includes('jacket') || cat.includes('hoodie');
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {{visible:boolean,onClose:()=>void,wardrobe?:any[]}} props
 */
export default function StyleAssistantModal({ visible, onClose, wardrobe = [] }) {
  const { theme } = useTheme();
  const [tab, setTab] = useState('swipe');
  const [outfits, setOutfits] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('local');

  // Persisted outfit lists
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [favouriteOutfits, setFavouriteOutfits] = useState([]);
  const [discardedOutfits, setDiscardedOutfits] = useState([]);

  // Settings
  const [occasion, setOccasion] = useState('casual');
  const [winterMode, setWinterMode] = useState(false);

  // Mix & match
  const [lockedTop, setLockedTop] = useState(null);
  const [lockedBottom, setLockedBottom] = useState(null);
  const [lockedShoes, setLockedShoes] = useState(null);

  // Shop
  const [shopResults, setShopResults] = useState(null);
  const [shopLoading, setShopLoading] = useState(false);

  const [localWardrobe, setLocalWardrobe] = useState([]);

  const pan = useRef(new Animated.ValueXY()).current;

  // Load wardrobe + persisted outfits when modal opens
  useEffect(() => {
    if (!visible) return;
    getUserWardrobeItems()
      .then(data => setLocalWardrobe(data.items || []))
      .catch(e => console.log('Wardrobe fetch error:', e));

    fetchOutfitsFromFirebase('saved').then(setSavedOutfits);
    fetchOutfitsFromFirebase('favourite').then(setFavouriteOutfits);
    fetchOutfitsFromFirebase('discarded').then(setDiscardedOutfits);
  }, [visible]);

  const loadOutfits = async () => {
    setLoading(true);
    setOutfits([]);
    setCurrentIdx(0);
    try {
      // In winter mode include jackets/hoodies if available
      let wardrobeToUse = localWardrobe;
      if (!winterMode) {
        // Filter out winter items when winter mode is off
        wardrobeToUse = localWardrobe.filter(i => !isWinterItem(i));
      }

      const result = await getRecommendations({
        occasion,
        temperatureC: winterMode ? 8 : 24,
        lockedTop,
        lockedBottom,
        lockedShoes,
        wardrobe: wardrobeToUse,
      });
      setOutfits(result.outfits || []);
      setSource(result.source || 'local');
    } catch (e) {
      console.log('Recommendation error:', e);
    }
    setLoading(false);
  };

  // ── Swipe logic ────────────────────────────────────────────────────────────

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => pan.setValue({ x: g.dx, y: g.dy }),
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD) doSwipe('right');
      else if (g.dx < -SWIPE_THRESHOLD) doSwipe('left');
      else if (g.dy < -SWIPE_THRESHOLD) doSwipe('up');
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  });

  const doSwipe = (dir) => {
    const toX = dir === 'right' ? W * 1.5 : dir === 'left' ? -W * 1.5 : 0;
    const toY = dir === 'up' ? -600 : 0;
    Animated.timing(pan, { toValue: { x: toX, y: toY }, duration: 280, useNativeDriver: false }).start(async () => {
      const outfit = outfits[currentIdx];
      if (outfit) {
        if (dir === 'right') {
          const docId = await saveOutfitToFirebase(outfit, 'saved');
          if (docId) setSavedOutfits(prev => [...prev, { ...outfit, docId }]);
        } else if (dir === 'up') {
          const docId = await saveOutfitToFirebase(outfit, 'favourite');
          if (docId) setFavouriteOutfits(prev => [...prev, { ...outfit, docId }]);
        } else if (dir === 'left') {
          const docId = await saveOutfitToFirebase(outfit, 'discarded');
          if (docId) setDiscardedOutfits(prev => [...prev, { ...outfit, docId }]);
        }
      }
      pan.setValue({ x: 0, y: 0 });
      setCurrentIdx(i => i + 1);
    });
  };

  const unsaveOutfit = async (docId, type) => {
    await removeOutfitFromFirebase(docId);
    if (type === 'saved') setSavedOutfits(prev => prev.filter(o => o.docId !== docId));
    if (type === 'favourite') setFavouriteOutfits(prev => prev.filter(o => o.docId !== docId));
    if (type === 'discarded') setDiscardedOutfits(prev => prev.filter(o => o.docId !== docId));
  };

  const rotate = pan.x.interpolate({ inputRange: [-W, 0, W], outputRange: ['-12deg', '0deg', '12deg'] });
  const likeOpacity = pan.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const favOpacity = pan.y.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const handleShopOutfit = async (outfit) => {
    setShopLoading(true);
    setTab('shop');
    try {
      const top = outfit.top || outfit.shirt;
      const bottom = outfit.bottom || outfit.pants;
      const shoes = outfit.shoes;
      const results = {};
      if (top) results.top = await searchProductsOnline(top);
      if (bottom) results.bottom = await searchProductsOnline(bottom);
      if (shoes) results.shoes = await searchProductsOnline(shoes);
      setShopResults({ outfit, results });
    } catch (e) { console.log('Shop error:', e); }
    setShopLoading(false);
  };

  const tops      = localWardrobe.filter(i => getItemCategory(i) === 'top');
  const bottoms   = localWardrobe.filter(i => getItemCategory(i) === 'bottom');
  const shoesList = localWardrobe.filter(i => getItemCategory(i) === 'shoes');
  const currentOutfit = outfits[currentIdx];

  // ── Outfit card renderer (reused in saved/fav/discarded) ──────────────────

  const renderOutfitRow = (outfit, i, type) => (
    <View key={outfit.docId || i} style={s.savedCard}>
      <View style={s.savedItems}>
        {[outfit.top || outfit.shirt, outfit.bottom || outfit.pants, outfit.shoes].map((item, j) => (
          item?.image ? (
            <Image key={j} source={{ uri: item.image }} style={s.savedImg} />
          ) : (
            <View key={j} style={[s.savedImg, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 20 }}>{j === 0 ? '👕' : j === 1 ? '👖' : '👟'}</Text>
            </View>
          )
        ))}
      </View>
      <View style={s.savedMeta}>
        <Text style={s.savedScore}>⭐ {outfit.score?.total?.toFixed(1) || '—'}/10</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={s.shopSmallBtn} onPress={() => handleShopOutfit(outfit)}>
            <Text style={s.shopSmallBtnText}>Shop →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.shopSmallBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' }]}
            onPress={() => unsaveOutfit(outfit.docId, type)}
          >
            <Text style={[s.shopSmallBtnText, { color: '#666' }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[s.container, { backgroundColor: theme.bg }]}>

        {/* Header */}
        <View style={[s.header, { borderBottomColor: theme.bg2 }]}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={[s.closeText, { color: theme.text2 }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: theme.text }]}>Style Assistant</Text>
          {/* Winter mode toggle */}
          <View style={s.winterToggle}>
            <Text style={[s.winterLabel, { color: theme.text2 }]}>❄</Text>
            <Switch
              value={winterMode}
              onValueChange={setWinterMode}
              trackColor={{ false: '#ddd', true: '#3b82f6' }}
              thumbColor={winterMode ? '#fff' : '#fff'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Winter mode banner */}
        {winterMode && (
          <View style={s.winterBanner}>
            <Text style={s.winterBannerText}>
              ❄️ Winter Mode — jackets & hoodies included in outfits
            </Text>
          </View>
        )}

        {/* Tabs — 5 tabs now */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll}>
          {[
            { key: 'swipe',    label: 'Discover' },
            { key: 'lock',     label: 'Mix & Match' },
            { key: 'shop',     label: 'Shop' },
            { key: 'saved',    label: `Saved (${savedOutfits.length})` },
            { key: 'favourite',label: `★ Fav (${favouriteOutfits.length})` },
            { key: 'discarded',label: `Discarded (${discardedOutfits.length})` },
          ].map(t => (
            <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]} onPress={() => setTab(t.key)}>
              <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── SWIPE TAB ── */}
        {tab === 'swipe' && (
          <ScrollView contentContainerStyle={s.swipeArea} showsVerticalScrollIndicator={false}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.occasionRow}>
              {OCCASIONS.map(o => (
                <TouchableOpacity key={o} style={[s.occasionPill, occasion === o && s.occasionPillActive]} onPress={() => setOccasion(o)}>
                  <Text style={[s.occasionText, occasion === o && s.occasionTextActive]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loading ? (
              <ActivityIndicator size="large" color="#000" style={{ marginTop: 60 }} />
            ) : outfits.length === 0 ? (
              <TouchableOpacity style={[s.generateBtn, { backgroundColor: theme.tint }]} onPress={loadOutfits}>
                <Text style={[s.generateBtnText, { color: theme.bg }]}>Generate Outfits →</Text>
              </TouchableOpacity>
            ) : currentIdx >= outfits.length ? (
              <View style={s.doneBox}>
                <Text style={[s.doneText, { color: theme.text2 }]}>All outfits reviewed!</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity style={[s.generateBtn, { flex: 1, backgroundColor: theme.tint }]} onPress={loadOutfits}>
                    <Text style={[s.generateBtnText, { color: theme.bg }]}>Regenerate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.generateBtn, { flex: 1, backgroundColor: '#8b5cf6' }]} onPress={() => setTab('saved')}>
                    <Text style={s.generateBtnText}>View Saved</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Animated.View
                  style={[s.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }], backgroundColor: theme.card }]}
                  {...panResponder.panHandlers}
                >
                  <Animated.Text style={[s.hintLike, { opacity: likeOpacity }]}>SAVE</Animated.Text>
                  <Animated.Text style={[s.hintNope, { opacity: nopeOpacity }]}>SKIP</Animated.Text>
                  <Animated.Text style={[s.hintFav, { opacity: favOpacity }]}>FAV ★</Animated.Text>

                  <View style={s.itemRow}>
                    {[
                      { label: 'Top',    data: currentOutfit?.top    || currentOutfit?.shirt },
                      { label: 'Bottom', data: currentOutfit?.bottom || currentOutfit?.pants },
                      { label: 'Shoes',  data: currentOutfit?.shoes },
                      ...(currentOutfit?.jacket ? [{ label: 'Jacket', data: currentOutfit.jacket }] : []),
                    ].map(({ label, data }) => (
                      <View key={label} style={s.itemSlot}>
                        {data?.image ? (
                          <Image source={{ uri: data.image }} style={s.itemImg} />
                        ) : (
                          <View style={s.itemPlaceholder}>
                            <Text style={s.itemEmoji}>
                              {label === 'Top' ? '👕' : label === 'Bottom' ? '👖' : label === 'Jacket' ? '🧥' : '👟'}
                            </Text>
                          </View>
                        )}
                        <Text style={[s.itemLabel, { color: theme.text2 }]}>{label}</Text>
                        <Text style={[s.itemName, { color: theme.text }]} numberOfLines={1}>{data?.name || data?.category || label}</Text>
                      </View>
                    ))}
                  </View>

                  {currentOutfit?.score && (
                    <View style={s.scoreSection}>
                      {[
                        { label: 'Color',     val: currentOutfit.score.color,     color: '#22c55e' },
                        { label: 'Coherence', val: currentOutfit.score.coherence, color: '#8b5cf6' },
                        { label: 'Occasion',  val: currentOutfit.score.occasion,  color: '#3b82f6' },
                      ].map(bar => (
                        <View key={bar.label} style={s.scoreRow}>
                          <Text style={[s.scoreLabel, { color: theme.text2 }]}>{bar.label}</Text>
                          <View style={s.scoreBg}>
                            <View style={[s.scoreFill, { width: `${(bar.val || 0) * 10}%`, backgroundColor: bar.color }]} />
                          </View>
                          <Text style={[s.scoreVal, { color: theme.text2 }]}>{bar.val?.toFixed(1)}</Text>
                        </View>
                      ))}
                      <Text style={[s.totalScore, { color: theme.text }]}>Overall: {currentOutfit.score.total?.toFixed(1)}/10</Text>
                    </View>
                  )}

                  <TouchableOpacity style={[s.shopBtn, { backgroundColor: theme.tint }]} onPress={() => handleShopOutfit(currentOutfit)}>
                    <Text style={[s.shopBtnText, { color: theme.bg }]}>Shop this look →</Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* 3 action buttons: Discard / Favourite / Save */}
                <View style={s.btnRow}>
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#fff0f0' }]} onPress={() => doSwipe('left')}>
                      <Text style={{ fontSize: 24, color: '#ef4444' }}>✕</Text>
                    </TouchableOpacity>
                    <Text style={[s.btnLabel, { color: theme.text2 }]}>Discard</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#fffbeb', width: 52, height: 52 }]} onPress={() => doSwipe('up')}>
                      <Text style={{ fontSize: 20, color: '#f59e0b' }}>★</Text>
                    </TouchableOpacity>
                    <Text style={[s.btnLabel, { color: theme.text2 }]}>Favourite</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#f0fff0', width: 68, height: 68 }]} onPress={() => doSwipe('right')}>
                      <Text style={{ fontSize: 26, color: '#22c55e' }}>♥</Text>
                    </TouchableOpacity>
                    <Text style={[s.btnLabel, { color: theme.text2 }]}>Save</Text>
                  </View>
                </View>

                <Text style={[s.swipeHint, { color: theme.text2 }]}>{currentIdx + 1} of {outfits.length} outfits</Text>
              </>
            )}
          </ScrollView>
        )}

        {/* ── MIX & MATCH TAB ── */}
        {tab === 'lock' && (
          <ScrollView style={s.lockArea}>
            <Text style={s.lockHint}>Lock items you want to wear. Then generate outfits that match them.</Text>
            {[
              { label: 'Tops',    items: tops,      locked: lockedTop,    setLocked: setLockedTop },
              { label: 'Bottoms', items: bottoms,   locked: lockedBottom, setLocked: setLockedBottom },
              { label: 'Shoes',   items: shoesList, locked: lockedShoes,  setLocked: setLockedShoes },
            ].map(group => (
              <View key={group.label} style={s.lockGroup}>
                <Text style={s.lockGroupLabel}>{group.label}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {group.items.length === 0 ? (
                    <Text style={s.emptyGroupText}>No {group.label.toLowerCase()} in wardrobe</Text>
                  ) : group.items.map(item => {
                    const isLocked = group.locked?.id === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[s.lockItem, isLocked && s.lockItemActive]}
                        onPress={() => group.setLocked(isLocked ? null : item)}
                      >
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={s.lockImg} />
                        ) : (
                          <View style={[s.lockImg, { alignItems: 'center', justifyContent: 'center', backgroundColor: item.color || '#eee' }]}>
                            <Text style={{ fontSize: 24 }}>
                              {group.label === 'Tops' ? '👕' : group.label === 'Bottoms' ? '👖' : '👟'}
                            </Text>
                          </View>
                        )}
                        {isLocked && <Text style={s.lockBadge}>🔒</Text>}
                        <Text style={s.lockItemName} numberOfLines={1}>{item.name || item.category}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
            <TouchableOpacity style={[s.generateBtn, { margin: 20 }]} onPress={() => { setTab('swipe'); loadOutfits(); }}>
              <Text style={s.generateBtnText}>Generate matching outfits →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── SHOP TAB ── */}
        {tab === 'shop' && (
          <ScrollView style={s.shopArea}>
            {shopLoading ? (
              <ActivityIndicator size="large" color="#000" style={{ marginTop: 60 }} />
            ) : !shopResults ? (
              <View style={s.emptyShop}>
                <Text style={s.emptyShopText}>Tap "Shop this look" on any outfit card to find pieces online.</Text>
                <TouchableOpacity style={s.generateBtn} onPress={() => setTab('swipe')}>
                  <Text style={s.generateBtnText}>← Back to outfits</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={s.shopSectionTitle}>Find these pieces online</Text>
                {Object.entries(shopResults.results).map(([cat, items]) => (
                  <View key={cat} style={s.shopCategory}>
                    <Text style={s.shopCatLabel}>{cat.toUpperCase()}</Text>
                    {items.map(product => (
                      <TouchableOpacity
                        key={product.id}
                        style={s.productCard}
                        onPress={() => product.link && Linking.openURL(product.link)}
                      >
                        {product.image ? (
                          <Image source={{ uri: product.image }} style={s.productImg} />
                        ) : (
                          <View style={[s.productImg, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 28 }}>🛍️</Text>
                          </View>
                        )}
                        <View style={s.productInfo}>
                          <Text style={s.productTitle} numberOfLines={2}>{product.title}</Text>
                          {product.price && <Text style={s.productPrice}>{product.price}</Text>}
                          <View style={s.platformBadge}>
                            <Text style={s.platformText}>{product.platform}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        )}

        {/* ── SAVED TAB ── */}
        {tab === 'saved' && (
          <ScrollView style={s.savedArea}>
            {savedOutfits.length === 0 ? (
              <View style={s.emptyShop}>
                <Text style={s.emptyShopText}>No saved outfits yet. Swipe right to save.</Text>
              </View>
            ) : savedOutfits.map((outfit, i) => renderOutfitRow(outfit, i, 'saved'))}
          </ScrollView>
        )}

        {/* ── FAVOURITES TAB ── */}
        {tab === 'favourite' && (
          <ScrollView style={s.savedArea}>
            {favouriteOutfits.length === 0 ? (
              <View style={s.emptyShop}>
                <Text style={s.emptyShopText}>No favourites yet. Swipe up or tap ★ to favourite.</Text>
              </View>
            ) : favouriteOutfits.map((outfit, i) => renderOutfitRow(outfit, i, 'favourite'))}
          </ScrollView>
        )}

        {/* ── DISCARDED TAB ── */}
        {tab === 'discarded' && (
          <ScrollView style={s.savedArea}>
            {discardedOutfits.length === 0 ? (
              <View style={s.emptyShop}>
                <Text style={s.emptyShopText}>No discarded outfits.</Text>
              </View>
            ) : (
              <>
                <Text style={s.discardedNote}>
                  These outfits were discarded. Tap Remove to clear them, or Shop to find the pieces anyway.
                </Text>
                {discardedOutfits.map((outfit, i) => renderOutfitRow(outfit, i, 'discarded'))}
              </>
            )}
          </ScrollView>
        )}

      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#fff' },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  closeBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText:         { fontSize: 18, color: '#666' },
  headerTitle:       { fontSize: 17, fontWeight: '600', color: '#111' },
  winterToggle:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  winterLabel:       { fontSize: 16 },
  winterBanner:      { backgroundColor: '#eff6ff', paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#dbeafe' },
  winterBannerText:  { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  tabsScroll:        { flexGrow: 0, backgroundColor: '#f8f8f8', paddingHorizontal: 8, paddingVertical: 4 },
  tab:               { paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center', borderRadius: 8, marginRight: 4 },
  tabActive:         { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText:           { fontSize: 12, color: '#999', whiteSpace: 'nowrap' },
  tabTextActive:     { color: '#111', fontWeight: '600' },
  swipeArea:         { alignItems: 'center', paddingBottom: 40 },
  occasionRow:       { paddingHorizontal: 16, paddingVertical: 12 },
  occasionPill:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff' },
  occasionPillActive:{ backgroundColor: '#000', borderColor: '#000' },
  occasionText:      { fontSize: 12, color: '#555' },
  occasionTextActive:{ color: '#fff' },
  card:              { width: W - 32, backgroundColor: '#fff', borderRadius: 20, padding: 20, marginHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, elevation: 6, marginBottom: 16 },
  hintLike:          { position: 'absolute', top: 20, left: 20, color: '#22c55e', fontSize: 16, fontWeight: '800', borderWidth: 2.5, borderColor: '#22c55e', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, zIndex: 10 },
  hintNope:          { position: 'absolute', top: 20, right: 20, color: '#ef4444', fontSize: 16, fontWeight: '800', borderWidth: 2.5, borderColor: '#ef4444', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, zIndex: 10 },
  hintFav:           { position: 'absolute', top: 60, left: '30%', color: '#f59e0b', fontSize: 16, fontWeight: '800', borderWidth: 2.5, borderColor: '#f59e0b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, zIndex: 10 },
  itemRow:           { flexDirection: 'row', justifyContent: 'space-around', marginTop: 32, marginBottom: 16, flexWrap: 'wrap' },
  itemSlot:          { alignItems: 'center', width: 80, marginBottom: 8 },
  itemImg:           { width: 76, height: 96, borderRadius: 12 },
  itemPlaceholder:   { width: 76, height: 96, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  itemEmoji:         { fontSize: 28 },
  itemLabel:         { fontSize: 10, color: '#aaa', marginTop: 6 },
  itemName:          { fontSize: 11, color: '#333', fontWeight: '500', textAlign: 'center', marginTop: 2 },
  scoreSection:      { marginTop: 8, marginBottom: 4 },
  scoreRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  scoreLabel:        { fontSize: 11, color: '#999', width: 65 },
  scoreBg:           { flex: 1, height: 4, backgroundColor: '#f0f0f0', borderRadius: 2, overflow: 'hidden' },
  scoreFill:         { height: 4, borderRadius: 2 },
  scoreVal:          { fontSize: 11, color: '#888', width: 24, textAlign: 'right' },
  totalScore:        { textAlign: 'center', color: '#333', fontWeight: '600', marginTop: 8, fontSize: 14 },
  shopBtn:           { marginTop: 14, backgroundColor: '#000', paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  shopBtnText:       { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnRow:            { flexDirection: 'row', gap: 20, justifyContent: 'center', alignItems: 'flex-start', marginTop: 8, marginBottom: 4 },
  actionBtn:         { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  btnLabel:          { fontSize: 10, color: '#aaa', marginTop: 4, textAlign: 'center' },
  swipeHint:         { fontSize: 12, color: '#bbb', marginTop: 4 },
  generateBtn:       { backgroundColor: '#000', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', marginTop: 20 },
  generateBtnText:   { color: '#fff', fontSize: 15, fontWeight: '600' },
  doneBox:           { alignItems: 'center', marginTop: 60, gap: 16, paddingHorizontal: 20, width: '100%' },
  doneText:          { fontSize: 16, color: '#999' },
  lockArea:          { flex: 1, padding: 16 },
  lockHint:          { fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 20 },
  lockGroup:         { marginBottom: 24 },
  lockGroupLabel:    { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 10, letterSpacing: 0.5 },
  emptyGroupText:    { fontSize: 12, color: '#bbb', paddingVertical: 12 },
  lockItem:          { width: 80, height: 100, marginRight: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e5e5', overflow: 'visible', alignItems: 'center' },
  lockItemActive:    { borderColor: '#000', borderWidth: 2 },
  lockImg:           { width: 76, height: 88, borderRadius: 10 },
  lockBadge:         { position: 'absolute', top: -8, right: -8, fontSize: 14 },
  lockItemName:      { fontSize: 10, color: '#666', marginTop: 4, width: 76, textAlign: 'center' },
  shopArea:          { flex: 1, padding: 16 },
  shopSectionTitle:  { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 16 },
  shopCategory:      { marginBottom: 24 },
  shopCatLabel:      { fontSize: 12, fontWeight: '700', color: '#999', letterSpacing: 1, marginBottom: 10 },
  productCard:       { flexDirection: 'row', backgroundColor: '#f8f8f8', borderRadius: 12, padding: 12, marginBottom: 10, gap: 12 },
  productImg:        { width: 70, height: 80, borderRadius: 8 },
  productInfo:       { flex: 1, justifyContent: 'space-between' },
  productTitle:      { fontSize: 13, color: '#222', fontWeight: '500', lineHeight: 18 },
  productPrice:      { fontSize: 14, color: '#111', fontWeight: '700', marginTop: 4 },
  platformBadge:     { alignSelf: 'flex-start', backgroundColor: '#000', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  platformText:      { fontSize: 11, color: '#fff', fontWeight: '600' },
  emptyShop:         { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 20 },
  emptyShopText:     { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22 },
  savedArea:         { flex: 1, padding: 16 },
  savedCard:         { backgroundColor: '#f8f8f8', borderRadius: 14, padding: 14, marginBottom: 12 },
  savedItems:        { flexDirection: 'row', gap: 8, marginBottom: 10 },
  savedImg:          { width: 80, height: 96, borderRadius: 10 },
  savedMeta:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  savedScore:        { fontSize: 13, color: '#555', fontWeight: '600' },
  shopSmallBtn:      { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  shopSmallBtnText:  { color: '#fff', fontSize: 12, fontWeight: '600' },
  discardedNote:     { fontSize: 12, color: '#999', marginBottom: 16, lineHeight: 18 },
});