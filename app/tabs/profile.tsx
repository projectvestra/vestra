import { ScrollView, View, StyleSheet } from 'react-native';
import { fetchUserProfile } from '../../src/services/profileService';
import ProfileInfoCard from '../../src/components/ProfileInfoCard';
import SettingsRow from '../../src/components/SettingsRow';
import { Colors } from '../../constants/theme';
import { Text } from 'react-native';

export default function Profile() {
  const profile = fetchUserProfile();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ProfileInfoCard profile={profile} />
    
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingsRow label="Edit Profile" />
        <SettingsRow label="Preferences" />
        <SettingsRow label="Logout" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
  },
  sectionTitle: {
  marginTop: 28,
  marginBottom: 8,
  fontSize: 14,
  fontWeight: '600',
  color: Colors.light.icon,
},
});