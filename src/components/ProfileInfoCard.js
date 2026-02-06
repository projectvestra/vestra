import { View, Text, StyleSheet } from 'react-native';

export default function ProfileInfoCard({ profile }) {
  if (!profile) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.email}>{profile.email}</Text>
      <Text style={styles.meta}>
        Preferred Style: {profile.stylePreference}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#f4f4f4',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
});
