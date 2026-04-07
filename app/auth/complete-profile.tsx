import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../src/services/firebaseConfig';
import { claimUsername, isUsernameTaken } from '../../src/services/usernameService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Colors } from '../../constants/theme';

function defaultDisplayNameFromEmail(email: string) {
  if (!email) return '';
  const localPart = email.split('@')[0] || '';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((chunk: string) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export default function CompleteProfile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [error, setError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  const mustAskDisplayName = useMemo(() => {
    const providerId = user?.providerData?.[0]?.providerId;
    return providerId !== 'google.com';
  }, [user]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      const profileRef = doc(db, 'user_profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profile = profileSnap.data() || {};
        if (profile.username) {
          router.replace('/tabs/home');
          return;
        }

        const fallbackName =
          profile.displayName || user.displayName || defaultDisplayNameFromEmail(user.email || '');
        setDisplayName(fallbackName);
      } else {
        setDisplayName(user.displayName || defaultDisplayNameFromEmail(user.email || ''));
      }

      setBootLoading(false);
    };

    bootstrap();
  }, [router, user]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleUsernameChange = async (value: string) => {
    const clean = value.toLowerCase().trim();
    setUsername(clean);
    setUsernameError('');
    setUsernameAvailable(false);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setCheckingUsername(false);

    if (!clean) return;
    if (clean.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameError('Only letters, numbers, and underscores are allowed.');
      return;
    }

    setCheckingUsername(true);
    const requestSeq = ++requestSeqRef.current;

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const taken = await isUsernameTaken(clean);
        if (requestSeq !== requestSeqRef.current) return;
        if (taken) {
          setUsernameError('This username is already taken.');
          setUsernameAvailable(false);
          return;
        }
        setUsernameError('');
        setUsernameAvailable(true);
      } finally {
        if (requestSeq === requestSeqRef.current) {
          setCheckingUsername(false);
        }
      }
    }, 450);
  };

  const handleContinue = async () => {
    setError('');

    if (!user) {
      setError('You need to login first.');
      return;
    }

    if (!username) {
      setError('Username is required.');
      return;
    }

    if (usernameError) {
      setError('Please fix your username and try again.');
      return;
    }

    if (checkingUsername) {
      setError('Please wait for username availability check.');
      return;
    }

    if (mustAskDisplayName && !displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setLoading(true);
    try {
      const finalDisplayName = mustAskDisplayName
        ? displayName.trim()
        : user.displayName || defaultDisplayNameFromEmail(user.email || '');

      await claimUsername(user.uid, username, null);

      await setDoc(
        doc(db, 'user_profiles', user.uid),
        {
          displayName: finalDisplayName,
          email: user.email || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      if (finalDisplayName) {
        await updateProfile(user, { displayName: finalDisplayName });
      }

      router.replace('/tabs/home');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  if (bootLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Complete Profile</Text>
      <Text style={styles.subtitle}>Username is required before you continue.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {usernameError ? <Text style={styles.usernameError}>{usernameError}</Text> : null}
      {!usernameError && usernameAvailable ? (
        <Text style={styles.usernameAvailable}>Username available.</Text>
      ) : null}
      <TextInput
        placeholder="Username"
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        value={username}
        onChangeText={handleUsernameChange}
      />
      {checkingUsername ? <Text style={styles.helper}>Checking username...</Text> : null}

      {mustAskDisplayName ? (
        <TextInput
          placeholder="Display name"
          placeholderTextColor="#999"
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />
      ) : (
        <View style={styles.staticRow}>
          <Text style={styles.staticLabel}>Display name</Text>
          <Text style={styles.staticValue}>
            {user?.displayName || defaultDisplayNameFromEmail(user?.email || '')}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
  usernameError: {
    color: '#ef4444',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  usernameAvailable: {
    color: '#10b981',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  helper: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  staticRow: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  staticLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  staticValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
