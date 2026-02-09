import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (e) {
    console.error("FCM token error", e);
    return null;
  }
};
export const requestUserPermission = async () => {
  if (Platform.OS === "android") {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (!hasPermission) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
  }

  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    return authStatus;
  }
};
