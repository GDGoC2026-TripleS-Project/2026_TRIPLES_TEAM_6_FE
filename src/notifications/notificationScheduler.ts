import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { NotificationId } from './notificationIds';

export type ScheduleOptions = {
  id: NotificationId;
  title: string;
  body: string;
  hour: number;
  minute: number;
};

export async function cancelNotification(id: NotificationId) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function scheduleDailyNotification({
  id,
  title,
  body,
  hour,
  minute,
}: ScheduleOptions) {
  await cancelNotification(id);

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
