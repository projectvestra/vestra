import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerWithEmail } from '../../services/authService';
import { isUsernameTaken } from '../../services/usernameService';
import { useTheme } from '../../context/ThemeContext';
import { ui } from '../../theme/ui';

export default function SignupScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleUsernameChange = async (value) => {
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

  const handleSignup = async () => {
    setError('');

    if (!name || !username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    if (usernameError) {
      setError('Please fix the username before continuing.');
      return;
    }

    if (checkingUsername) {
      setError('Please wait for username availability check.');
      return;
    }

    setLoading(true);

    const result = await registerWithEmail(name, email, password, username);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    router.replace('/onboarding/step1');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.authCard, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
        <Text style={[styles.eyebrow, { color: theme.text3 }]}>VESTRA</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.text2 }]}>Set up your profile and start personal styling.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          placeholder="Full Name"
          placeholderTextColor={theme.text3}
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg3 }]}
          value={name}
          onChangeText={setName}
        />

        {usernameError ? <Text style={styles.usernameError}>{usernameError}</Text> : null}
        {!usernameError && usernameAvailable ? (
          <Text style={styles.usernameAvailable}>Username available.</Text>
        ) : null}
        <TextInput
          placeholder="Username"
          placeholderTextColor={theme.text3}
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg3 }]}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={handleUsernameChange}
        />
        {checkingUsername ? <Text style={[styles.infoText, { color: theme.text2 }]}>Checking username...</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.text3}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg3 }]}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={theme.text3}
          secureTextEntry
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg3 }]}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.bg} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: theme.bg }]}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <Text
          style={[styles.footerText, { color: theme.tint }]}
          onPress={() => router.push('/auth/login')}
        >
          Already have an account? Login
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    borderWidth: 1,
    borderRadius: ui.radius.xl,
    padding: 18,
    ...ui.shadow.elevated,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: ui.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  usernameError: {
    color: '#ef4444',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  usernameAvailable: {
    color: '#10b981',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: ui.radius.md,
    marginTop: 8,
  },
  primaryButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});