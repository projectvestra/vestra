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
import { Colors } from '../../../constants/theme';

export default function SignupScreen() {
  const router = useRouter();

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
    <View style={styles.container}>
      <Text style={styles.heading}>Create Account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#999"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {usernameError ? <Text style={styles.usernameError}>{usernameError}</Text> : null}
      {!usernameError && usernameAvailable ? (
        <Text style={styles.usernameAvailable}>Username available.</Text>
      ) : null}
      <TextInput
        placeholder="Username"
        placeholderTextColor="#999"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={handleUsernameChange}
      />
      {checkingUsername ? <Text style={styles.infoText}>Checking username...</Text> : null}

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <Text
        style={styles.footerText}
        onPress={() => router.push('/auth/login')}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  heading: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    color: Colors.light.text,
    backgroundColor: '#fff',
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
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});