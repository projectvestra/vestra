import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_PERMISSION_PROMPTED_KEY = '@vestra_notification_permission_prompted_v1';

export async function ensureNotificationPermissionPrompted(): Promise<void> {
  try {
    const prompted = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_PROMPTED_KEY);
    if (prompted === 'true') {
      return;
    }

    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_PROMPTED_KEY, 'true');
      return;
    }

    await Notifications.requestPermissionsAsync();
    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_PROMPTED_KEY, 'true');
  } catch (error) {
    console.log('Notification permission prompt failed:', error);
  }
}

export async function resetNotificationPermissionPrompted(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_PERMISSION_PROMPTED_KEY);
  } catch (error) {
    console.log('Notification permission prompt reset failed:', error);
  }
}

export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionResponse> {
  return Notifications.getPermissionsAsync();
}
