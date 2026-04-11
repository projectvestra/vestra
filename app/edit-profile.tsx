import { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Image,
  Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../src/services/firebaseConfig';
import { useTheme } from '../src/context/ThemeContext';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { isUsernameTaken, claimUsername } from '../src/services/usernameService';
import { uploadWardrobeImage } from '../src/services/cloudWardrobeService';
import { ui } from '../src/theme/ui';

const STYLE_OPTIONS = ['Casual', 'Formal', 'Streetwear', 'Minimalist', 'Bohemian', 'Sporty', 'Vintage'];
const COLOR_OPTIONS = ['Black', 'White', 'Navy', 'Grey', 'Beige', 'Brown', 'Red', 'Green', 'Blue'];
const BODY_TYPES = ['Slim', 'Athletic', 'Regular', 'Plus Size', 'Petite'];

export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Basic info
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  // Preferences
  const [height, setHeight] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const initialSnapshotRef = useRef<string>('');

  const normalizeArray = (arr: string[]) => [...arr].map(v => v.trim()).filter(Boolean).sort();

  const buildSnapshot = (overrides?: {
    displayName?: string;
    username?: string;
    height?: string;
    bodyType?: string;
    selectedStyles?: string[];
    selectedColors?: string[];
    photoUrl?: string;
    bannerImageUrl?: string;
  }) => {
    const snapshot = {
      displayName: (overrides?.displayName ?? displayName).trim(),
      username: (overrides?.username ?? username).trim().toLowerCase(),
      height: (overrides?.height ?? height).trim(),
      bodyType: (overrides?.bodyType ?? bodyType).trim(),
      selectedStyles: normalizeArray(overrides?.selectedStyles ?? selectedStyles),
      selectedColors: normalizeArray(overrides?.selectedColors ?? selectedColors),
      photoUrl: (overrides?.photoUrl ?? photoUrl).trim(),
      bannerImageUrl: (overrides?.bannerImageUrl ?? bannerImageUrl).trim(),
    };
    return JSON.stringify(snapshot);
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!initialSnapshotRef.current) return false;
    return buildSnapshot() !== initialSnapshotRef.current;
  }, [displayName, username, height, bodyType, selectedStyles, selectedColors, photoUrl, bannerImageUrl]);
  const isBusy = saving || uploadingPhoto || uploadingBanner;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const initialDisplayName = user.displayName || '';
      setDisplayName(initialDisplayName);

      // Load from Firestore
      const ref = doc(db, 'user_profiles', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const initialUsername = data.username || '';
        const initialHeight = data.height?.toString() || '';
        const initialBodyType = data.bodyType || '';
        const initialStyles = data.styles || [];
        const initialColors = data.preferredColors || [];
        const initialPhotoUrl = data.photoUrl || '';
        const initialBannerImageUrl = data.bannerImageUrl || '';

        setUsername(initialUsername);
        setOriginalUsername(initialUsername);
        setHeight(initialHeight);
        setBodyType(initialBodyType);
        setSelectedStyles(initialStyles);
        setSelectedColors(initialColors);
        setPhotoUrl(initialPhotoUrl);
        setBannerImageUrl(initialBannerImageUrl);

        initialSnapshotRef.current = buildSnapshot({
          displayName: initialDisplayName,
          username: initialUsername,
          height: initialHeight,
          bodyType: initialBodyType,
          selectedStyles: initialStyles,
          selectedColors: initialColors,
          photoUrl: initialPhotoUrl,
          bannerImageUrl: initialBannerImageUrl,
        });
      } else {
        setUsername('');
        setOriginalUsername('');
        setHeight('');
        setBodyType('');
        setSelectedStyles([]);
        setSelectedColors([]);
        setPhotoUrl('');
        setBannerImageUrl('');
        initialSnapshotRef.current = buildSnapshot({
          displayName: initialDisplayName,
          username: '',
          height: '',
          bodyType: '',
          selectedStyles: [],
          selectedColors: [],
          photoUrl: '',
          bannerImageUrl: '',
        });
      }
    } catch (e) {
      console.log('Load profile error:', e);
    }
    setLoading(false);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!hasUnsavedChanges) {
      router.back();
      return;
    }

    setSaving(true);

    try {
      const trimmedDisplayName = displayName.trim();
      const trimmedUsername = username.trim().toLowerCase();

      // Update Firebase Auth display name
      if (trimmedDisplayName !== (user.displayName || '').trim()) {
        await updateProfile(user, { displayName: trimmedDisplayName });
      }

      if (trimmedUsername && trimmedUsername !== originalUsername.trim().toLowerCase()) {
        const taken = await isUsernameTaken(trimmedUsername);
        if (taken) {
          Alert.alert('Username taken', 'Please choose a different username');
          setSaving(false);
          return;
        }
        await claimUsername(user.uid, trimmedUsername, originalUsername);
        setOriginalUsername(trimmedUsername);
      }

      // Save everything to Firestore
      await setDoc(doc(db, 'user_profiles', user.uid), {
        username: trimmedUsername,
        displayName: trimmedDisplayName,
        photoUrl,
        bannerImageUrl,
        height: height ? parseInt(height) : null,
        bodyType,
        styles: selectedStyles,
        preferredColors: selectedColors,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      initialSnapshotRef.current = buildSnapshot({
        displayName: trimmedDisplayName,
        username: trimmedUsername,
        height,
        bodyType,
        selectedStyles,
        selectedColors,
        photoUrl,
        bannerImageUrl,
      });
      router.replace({ pathname: '/tabs/profile', params: { toast: 'profile-saved' } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  const pickProfileMedia = async (kind: 'photo' | 'banner') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Gallery permission is required to pick images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      if (kind === 'photo') {
        setUploadingPhoto(true);
      } else {
        setUploadingBanner(true);
      }
      const uploadedUrl = await uploadWardrobeImage(result.assets[0].uri);
      if (kind === 'photo') {
        setPhotoUrl(uploadedUrl);
      } else {
        setBannerImageUrl(uploadedUrl);
      }
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message || 'Could not upload image.');
    } finally {
      if (kind === 'photo') {
        setUploadingPhoto(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  const clearProfileMedia = (kind: 'photo' | 'banner') => {
    if (kind === 'photo') {
      setPhotoUrl('');
      return;
    }
    setBannerImageUrl('');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => {
          if (hasUnsavedChanges) {
            Alert.alert(
              'Unsaved Changes',
              'You have unsaved changes. Do you want to save them?',
              [
                { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                { text: 'Save', onPress: handleSave },
              ]
            );
          } else {
            router.back();
          }
        }}>
          <Text style={[styles.closeText, { color: theme.text2 }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Basic Info */}
      <Text style={[styles.sectionTitle, { color: theme.text } ]}>Basic Info</Text>

      <Text style={[styles.label, { color: theme.text2 }]}>Profile Photo</Text>
      <View style={styles.photoCenterWrap}>
        <TouchableOpacity
          onPress={() => pickProfileMedia('photo')}
          style={[styles.photoPickerBtn, { borderColor: theme.border, backgroundColor: theme.bg2 }]}
          disabled={isBusy}
        >
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photoPreview} resizeMode="cover" />
          ) : (
            <Text style={[styles.photoInitialText, { color: theme.text }]}> 
              {(displayName?.charAt(0) || auth.currentUser?.displayName?.charAt(0) || 'U').toUpperCase()}
            </Text>
          )}
          {uploadingPhoto ? <View style={styles.uploadOverlay}><ActivityIndicator color="#fff" /></View> : null}
        </TouchableOpacity>
        {photoUrl ? (
          <TouchableOpacity onPress={() => clearProfileMedia('photo')} disabled={isBusy}>
            <Text style={[styles.removeMediaText, { color: theme.text2 }]}>Remove photo</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={[styles.label, { color: theme.text2 }]}>Profile Banner</Text>
      <TouchableOpacity
        onPress={() => pickProfileMedia('banner')}
        style={[
          styles.mediaPickerBtn,
          { borderColor: theme.border, backgroundColor: theme.bg2, height: bannerImageUrl ? 120 : 64 },
        ]}
        disabled={isBusy}
      >
        {bannerImageUrl ? (
          <Image source={{ uri: bannerImageUrl }} style={styles.bannerPreview} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={theme.bg === '#0b0c0f' ? ['#0d1017', '#161a24', '#1d2430'] : ['#ffffff', '#f7f7f4', '#ecece6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerPreview}
          />
        )}
        {uploadingBanner ? <View style={styles.uploadOverlay}><ActivityIndicator color="#fff" /></View> : null}
      </TouchableOpacity>
      {bannerImageUrl ? (
        <TouchableOpacity onPress={() => clearProfileMedia('banner')} disabled={isBusy}>
          <Text style={[styles.removeMediaText, { color: theme.text2 }]}>Remove banner</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={[styles.label, { color: theme.text2 }]}>Display Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.bg2, borderColor: theme.border, color: theme.text }]}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your display name"
        placeholderTextColor="#999"
      />

      <Text style={[styles.label, { color: theme.text2 }]}>Username</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.bg2, borderColor: theme.border, color: theme.text }]}
        value={username}
        onChangeText={setUsername}
        placeholder="@username"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: theme.text2 }]}>Height (cm)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.bg2, borderColor: theme.border, color: theme.text }]}
        value={height}
        onChangeText={setHeight}
        placeholder="e.g. 175"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      {/* Body Type */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Body Type</Text>
      <View style={styles.chipRow}>
        {BODY_TYPES.map(bt => (
          <TouchableOpacity
            key={bt}
            style={[
              styles.chip,
              { backgroundColor: bodyType === bt ? theme.tint : theme.bg2, borderColor: theme.border },
            ]}
            onPress={() => setBodyType(bt)}
          >
            <Text style={[
              styles.chipText,
              { color: bodyType === bt ? theme.bg : theme.text },
            ]}>
              {bt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Style Preferences */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Style Preferences</Text>
      <View style={styles.chipRow}>
        {STYLE_OPTIONS.map(s => (
          <TouchableOpacity
            key={s}
            style={[
              styles.chip,
              { backgroundColor: selectedStyles.includes(s) ? theme.tint : theme.bg2, borderColor: theme.border },
            ]}
            onPress={() => toggleStyle(s)}
          >
            <Text style={[
              styles.chipText,
              { color: selectedStyles.includes(s) ? theme.bg : theme.text },
            ]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Preferences */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferred Colors</Text>
      <View style={styles.chipRow}>
        {COLOR_OPTIONS.map(c => (
          <TouchableOpacity
            key={c}
            style={[
              styles.chip,
              { backgroundColor: selectedColors.includes(c) ? theme.tint : theme.bg2, borderColor: theme.border },
            ]}
            onPress={() => toggleColor(c)}
          >
            <Text style={[
              styles.chipText,
              { color: selectedColors.includes(c) ? theme.bg : theme.text },
            ]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.tint }]}
        onPress={handleSave}
        disabled={isBusy}
      >
        {isBusy
          ? <ActivityIndicator color={theme.bg} />
          : <Text style={[styles.saveButtonText, { color: theme.bg }]}>Save Changes</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 18 },
  title: { fontSize: ui.type.title, fontWeight: '800', letterSpacing: -0.4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginTop: 24, marginBottom: 12, letterSpacing: -0.2 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderRadius: ui.radius.md,
    paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, marginBottom: 14,
  },
  mediaPickerBtn: {
    borderWidth: 1,
    borderRadius: ui.radius.md,
    height: 120,
    marginBottom: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
  },
  photoPickerBtn: {
    borderWidth: 1,
    borderRadius: 42,
    width: 84,
    height: 84,
    marginBottom: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  mediaPickerText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  photoCenterWrap: {
    alignItems: 'center',
  },
  removeMediaText: {
    marginTop: -6,
    marginBottom: 14,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  uploadOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(8,10,14,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitialText: {
    fontSize: 28,
    fontWeight: '700',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: ui.radius.pill,
    borderWidth: 1, marginBottom: 4,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  saveButton: {
    borderRadius: ui.radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 28,
  },
  saveButtonText: { fontSize: 16, fontWeight: '800' },
});