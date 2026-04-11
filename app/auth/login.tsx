import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginWithEmailOrUsername, loginWithGoogle } from '../../src/services/authService';
import { useTheme } from '../../src/context/ThemeContext';
import { ui } from '../../src/theme/ui';

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!input || !password) {
      setError('Email or username and password are required.');
      return;
    }
    setLoading(true);

    const result = await loginWithEmailOrUsername(input, password);
    
    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Check if user needs profile setup (display name, username, password)
    if (result.requiresProfileSetup || result.requiresUsername) {
      router.replace('/auth/complete-profile');
    } else {
      router.replace('/(tabs)/home');
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <View style={[styles.authCard, { backgroundColor: theme.bg2, borderColor: theme.border }]}> 
        <Text style={[styles.eyebrow, { color: theme.text3 }]}>VESTRA</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.text2 }]}>Sign in to continue building your looks.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          placeholder="Sign in with email or username"
          placeholderTextColor={theme.text3}
          autoCapitalize="none"
          keyboardType="default"
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg3 }]}
          value={input}
          onChangeText={setInput}
        />

        <View style={[styles.passwordWrapper, { borderColor: theme.border, backgroundColor: theme.bg3 }]}> 
          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.text3}
            secureTextEntry={!showPassword}
            style={[styles.passwordInput, { color: theme.text }]}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(v => !v)}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={theme.bg} />
            : <Text style={[styles.primaryButtonText, { color: theme.bg }]}>Login</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={[styles.googleButton, { borderColor: theme.border, backgroundColor: theme.bg3 }]} onPress={handleGoogleLogin}>
          <Text style={[styles.googleText, { color: theme.text }]}>Continue with Google</Text>
        </TouchableOpacity>

        <Text
          style={[styles.footerText, { color: theme.tint }]}
          onPress={() => router.push('/auth/signup')}
        >
          Do not have an account? Sign up
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: ui.radius.md,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: ui.radius.md,
    marginTop: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  googleButton: {
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: ui.radius.md,
    marginTop: 12,
    alignItems: 'center',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});