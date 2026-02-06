import { View, StyleSheet } from 'react-native';
import { fetchUserProfile } from '../../src/services/profileService';
import ProfileInfoCard from '../../src/components/ProfileInfoCard';
import SettingsRow from '../../src/components/SettingsRow';


export default function Profile() {
  const profile = fetchUserProfile();

  return (
    <View style={styles.container}>
      <ProfileInfoCard profile={profile} />

<SettingsRow label="Edit Profile" />
<SettingsRow label="Preferences" />
<SettingsRow label="Logout" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
});
