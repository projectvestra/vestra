import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { db } from '../src/services/firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

// This screen lets devs send custom notifications to all users
// Access by navigating to /dev-notifications

export default function DevNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState([]);

  const sendNotification = async (toAll = false) => {
    if (!title || !body) {
      Alert.alert('Error', 'Title and body are required');
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        targetUserId: toAll ? null : (targetUser || null),
        toAll,
        createdAt: serverTimestamp(),
        read: false,
      });

      setSent(prev => [...prev, {
        title, body,
        target: toAll ? 'All users' : (targetUser || 'All users'),
        time: new Date().toLocaleTimeString(),
      }]);

      setTitle('');
      setBody('');
      setTargetUser('');
      Alert.alert('Sent', `Notification queued for ${toAll ? 'all users' : targetUser || 'all users'}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSending(false);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Dev Notification Panel</Text>
      <Text style={s.subtitle}>Send custom notifications to app users</Text>

      <View style={s.card}>
        <Text style={s.label}>Notification Title</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. New outfit styles available!"
          placeholderTextColor="#999"
        />

        <Text style={s.label}>Message Body</Text>
        <TextInput
          style={[s.input, { height: 80 }]}
          value={body}
          onChangeText={setBody}
          placeholder="e.g. Check out your new weekly planner..."
          placeholderTextColor="#999"
          multiline
        />

        <Text style={s.label}>Target User ID (leave blank for all users)</Text>
        <TextInput
          style={s.input}
          value={targetUser}
          onChangeText={setTargetUser}
          placeholder="Firebase user UID or leave blank"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: '#3b82f6' }]}
            onPress={() => sendNotification(false)}
            disabled={sending}
          >
            <Text style={s.btnText}>{sending ? 'Sending...' : 'Send to User'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: '#000' }]}
            onPress={() => sendNotification(true)}
            disabled={sending}
          >
            <Text style={s.btnText}>{sending ? 'Sending...' : 'Broadcast to All'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sent history */}
      {sent.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>Sent this session</Text>
          {sent.map((n, i) => (
            <View key={i} style={s.sentRow}>
              <Text style={s.sentTitle}>{n.title}</Text>
              <Text style={s.sentMeta}>{n.target} · {n.time}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff', padding: 20 },
  title:        { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 40 },
  subtitle:     { fontSize: 13, color: '#888', marginBottom: 24 },
  card:         { backgroundColor: '#f8f8f8', borderRadius: 16, padding: 16, marginBottom: 16 },
  label:        { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input:        { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 12, fontSize: 14, color: '#111' },
  btnRow:       { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn:          { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText:      { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
  sentRow:      { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sentTitle:    { fontSize: 14, color: '#111', fontWeight: '500' },
  sentMeta:     { fontSize: 12, color: '#888', marginTop: 2 },
});