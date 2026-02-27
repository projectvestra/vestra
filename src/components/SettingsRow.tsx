import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface SettingsRowProps {
  label: string;
  onPress?: () => void;
}

export default function SettingsRow({
  label,
  onPress,
}: SettingsRowProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  text: {
    fontSize: 15,
    color: '#111',
  },
});