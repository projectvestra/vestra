import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity 
       style={styles.primaryButton}
       onPress={() => router.push('/onboarding/step1')}
      >
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>

      <Text
        style={styles.footerText}
        onPress={() => router.push('/auth/signup')}
      >
        Don’t have an account? Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  heading: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111',
  },
  primaryButton: {
    backgroundColor: '#000',
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
    marginTop: 24,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});
