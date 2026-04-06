import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { claimUsername, isUsernameTaken } from '../services/usernameService';

export default function UsernameModal({ visible, onClose, currentUsername, onSuccess }) {
  const [username, setUsername] = useState(currentUsername || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (visible) {
      setUsername(currentUsername || '');
      setError('');
      setIsAvailable(null);
    }
  }, [visible, currentUsername]);

  const checkUsernameAvailability = async (value) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const taken = await isUsernameTaken(value.toLowerCase().trim());
      setIsAvailable(!taken);
    } catch (err) {
      setIsAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (value) => {
    setUsername(value);
    // Validate format: letters, numbers, underscores only
    if (!/^[a-z0-9_]*$/.test(value.toLowerCase())) {
      setError('Username can only contain letters, numbers, and underscores');
      setIsAvailable(false);
    } else if (value.length < 3 && value.length > 0) {
      setError('Username must be at least 3 characters');
      setIsAvailable(false);
    } else {
      setError('');
      checkUsernameAvailability(value);
    }
  };

  const handleSave = async () => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username === currentUsername) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await claimUsername(
        undefined, // Will use auth.currentUser inside the function
        username,
        currentUsername || null
      );
      setError('');
      onSuccess?.(username);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Set Username</Text>
          <Text style={styles.subtitle}>
            Choose a unique username for your account (3+ characters)
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>@</Text>
            <TextInput
              placeholder="username"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              value={username}
              onChangeText={handleUsernameChange}
              maxLength={30}
            />
            {checking && <ActivityIndicator size="small" color="#666" />}
            {!checking && isAvailable === true && (
              <Text style={styles.available}>✓</Text>
            )}
            {!checking && isAvailable === false && username.length >= 3 && (
              <Text style={styles.unavailable}>✕</Text>
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isAvailable && !error && (
            <Text style={styles.success}>Username is available!</Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isAvailable || error || loading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isAvailable || !!error || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111',
  },
  available: {
    fontSize: 18,
    color: '#10b981',
    marginLeft: 8,
  },
  unavailable: {
    fontSize: 18,
    color: '#ef4444',
    marginLeft: 8,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
  },
  success: {
    color: '#10b981',
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
