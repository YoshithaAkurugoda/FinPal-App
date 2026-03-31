import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FinPal',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  try {
    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const token =
      typeof tokenResponse.data === 'string' ? tokenResponse.data : null;
    return token;
  } catch {
    return null;
  }
}

export async function registerPushTokenWithServer(): Promise<void> {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) return;

  const token = await registerForPushNotificationsAsync();
  if (!token) return;

  try {
    await api.put('/users/fcm-token', { fcmToken: token });
  } catch {
    // Non-fatal — user can still use the app without push
  }
}
