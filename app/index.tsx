import { View, ActivityIndicator } from 'react-native';

export default function AppEntry() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}