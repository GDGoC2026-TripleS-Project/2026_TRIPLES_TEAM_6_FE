import * as Notifications from 'expo-notifications';

export async function ensureNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.status !== 'granted') {
    const result = await Notifications.requestPermissionsAsync();
    return result.status === 'granted';
  }

  return true;
}
