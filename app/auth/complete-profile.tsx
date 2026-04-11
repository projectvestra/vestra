import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../src/services/firebaseConfig';
import { useTheme } from '../../src/context/ThemeContext';
import { claimUsername, isUsernameTaken } from '../../src/services/usernameService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { linkEmailPasswordToCurrentUser } from '../../src/services/authService';

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
  const theme = useTheme();
  const user = auth.currentUser;

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: display name, 2: username, 3: password
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);

  const mustAskDisplayName = useMemo(() => {
    const providerId = user?.providerData?.[0]?.providerId;
    return providerId === 'google.com' && !user?.displayName;
  }, [user]);

  const isGoogleUser = useMemo(() => {
    const providerId = user?.providerData?.[0]?.providerId;
    return providerId === 'google.com';
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
          router.replace('/(tabs)/home');
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

  const handleDisplayNameNext = async () => {
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateProfile(auth.currentUser!, { displayName: displayName.trim() });
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleUsernameNext = async () => {
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

    setError('');
    setStep(3);
  };

  const handlePasswordNext = async () => {
    setPasswordError('');

    if (!user) {
      setError('You need to login first.');
      return;
    }

    // Password validation if provided
    if (password) {
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      setError('');
      const finalDisplayName = mustAskDisplayName
        ? displayName.trim()
        : user.displayName || defaultDisplayNameFromEmail(user.email || '');

      // Claim username
      await claimUsername(user.uid, username, null);

      // Update Firestore profile
      await setDoc(
        doc(db, 'user_profiles', user.uid),
        {
          displayName: finalDisplayName,
          email: user.email || '',
          profileSetupComplete: true,
          authProvider: user.providerData?.[0]?.providerId || 'password',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Link email/password if provided
      if (password.trim()) {
        const linkResult = await linkEmailPasswordToCurrentUser(password.trim());
        if (!linkResult.success) {
          setPasswordError(linkResult.message);
          setLoading(false);
          return;
        }
      }

      router.replace('/onboarding/step1');
    } catch (e: unknown) {
      setPasswordError(e instanceof Error ? e.message : 'Failed to complete profile.');
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.bg,
        },
        container: {
          flex: 1,
          backgroundColor: theme.bg,
        },
        loaderWrap: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.bg,
        },
        scrollContent: {
          minHeight: '100%',
          justifyContent: 'center',
          paddingVertical: 32,
        },
        contentCard: {
          marginHorizontal: 16,
          padding: 24,
          backgroundColor: theme.bg2,
          borderRadius: 12,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        },
        heading: {
          fontSize: 26,
          fontWeight: '700',
          marginBottom: 8,
          color: theme.text,
        },
        subtitle: {
          fontSize: 14,
          marginBottom: 20,
          color: theme.textSecondary,
          lineHeight: 20,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.text,
          marginBottom: 8,
        },
        optionalLabel: {
          fontSize: 12,
          color: theme.textSecondary,
          fontWeight: '500',
          marginLeft: 4,
        },
        inputContainer: {
          marginBottom: 16,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 12,
          fontSize: 16,
          color: theme.text,
          backgroundColor: theme.bg,
        },
        button: {
          backgroundColor: theme.tint,
          paddingVertical: 14,
          borderRadius: 8,
          marginTop: 24,
          alignItems: 'center',
        },
        buttonDisabled: {
          opacity: 0.6,
        },
        buttonText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
        },
        error: {
          color: '#ff4444',
          marginBottom: 12,
          fontSize: 13,
          fontWeight: '500',
        },
        usernameError: {
          color: '#ff4444',
          marginBottom: 6,
          fontSize: 12,
          fontWeight: '600',
        },
        usernameAvailable: {
          color: '#00cc00',
          marginBottom: 6,
          fontSize: 12,
          fontWeight: '600',
        },
        helper: {
          fontSize: 12,
          color: theme.textSecondary,
          marginBottom: 12,
          lineHeight: 16,
        },
        staticRow: {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          padding: 12,
          backgroundColor: theme.bg,
          marginBottom: 16,
        },
        staticLabel: {
          fontSize: 12,
          color: theme.textSecondary,
          marginBottom: 4,
        },
        staticValue: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.text,
        },
        stepCounter: {
          fontSize: 12,
          color: theme.textSecondary,
          marginBottom: 16,
          fontWeight: '500',
        },
      }),
    [theme]
  );

  if (bootLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      </SafeAreaView>
    );
  }

  const renderStep = () => {
    if (step === 1 && mustAskDisplayName) {
      return (
        <View>
          <Text style={styles.heading}>Welcome!</Text>
          <Text style={styles.subtitle}>
            We got your email from Google. Now let's set up your display name.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              placeholder="Enter your display name"
              placeholderTextColor={theme.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              editable={!loading}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleDisplayNameNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    } else if ((step === 1 && !mustAskDisplayName) || step === 2) {
      return (
        <View>
          <Text style={styles.heading}>Choose Username</Text>
          <Text style={styles.subtitle}>
            This is how other users will find and follow you.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter username"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !checkingUsername}
              style={styles.input}
            />
            {checkingUsername && (
              <Text style={styles.stepCounter}>Checking availability...</Text>
            )}
            {username.length >= 3 && !usernameError && !checkingUsername && (
              <Text style={styles.usernameAvailable}>✓ Username available</Text>
            )}
            {usernameError ? <Text style={styles.usernameError}>{usernameError}</Text> : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {!mustAskDisplayName && (
            <View style={styles.staticRow}>
              <Text style={styles.staticLabel}>Display name</Text>
              <Text style={styles.staticValue}>
                {user?.displayName || defaultDisplayNameFromEmail(user?.email || '')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (loading || checkingUsername) && styles.buttonDisabled]}
            onPress={handleUsernameNext}
            disabled={loading || checkingUsername || !usernameAvailable}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    } else if (step === 3) {
      return (
        <View>
          <Text style={styles.heading}>Add Password</Text>
          <Text style={styles.subtitle}>
            Optional: Set a password so you can also log in with email.
          </Text>

          <View style={styles.inputContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.optionalLabel}>(optional)</Text>
            </View>
            <TextInput
              placeholder="Enter password (optional)"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              style={styles.input}
            />
          </View>

          {password ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
                style={styles.input}
              />
            </View>
          ) : null}

          <Text style={styles.helper}>
            You can always add a password later in your settings.
          </Text>

          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePasswordNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>{renderStep()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Placeholder for deprecated styles - using theme-aware styles in component
