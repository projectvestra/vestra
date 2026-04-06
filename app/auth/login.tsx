import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginWithEmail, loginWithUsername, loginWithGoogle } from '../../src/services/authService';
import { Colors } from '../../constants/theme';

export default function Login() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'username'

  const handleLogin = async () => {
    setError('');
    if (!input || !password) {
      setError(`${loginMode === 'email' ? 'Email' : 'Username'} and password are required.`);
      return;
    }
    setLoading(true);
    
    let result;
    if (loginMode === 'email') {
      result = await loginWithEmail(input, password);
    } else {
      result = await loginWithUsername(input, password);
    }
    
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
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Back</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Login Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginMode === 'email' && styles.toggleButtonActive,
          ]}
          onPress={() => {
            setLoginMode('email');
            setInput('');
            setError('');
          }}
        >
          <Text
            style={[
              styles.toggleText,
              loginMode === 'email' && styles.toggleTextActive,
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginMode === 'username' && styles.toggleButtonActive,
          ]}
          onPress={() => {
            setLoginMode('username');
            setInput('');
            setError('');
          }}
        >
          <Text
            style={[
              styles.toggleText,
              loginMode === 'username' && styles.toggleTextActive,
            ]}
          >
            Username
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Field - Email or Username */}
      <TextInput
        placeholder={loginMode === 'email' ? 'Email' : 'Username'}
        placeholderTextColor="#999"
        autoCapitalize={loginMode === 'email' ? 'none' : 'none'}
        keyboardType={loginMode === 'email' ? 'email-address' : 'default'}
        style={styles.input}
        value={input}
        onChangeText={setInput}
      />

      {/* Password field with eye toggle */}
      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
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
        style={styles.primaryButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryButtonText}>Login</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text
        style={styles.footerText}
        onPress={() => router.push('/auth/signup')}
      >
        Don't have an account? Sign up
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
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.light.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  footerText: {
    marginTop: 24,
    textAlign: 'center',
    color: Colors.light.tint,
    fontSize: 14,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});