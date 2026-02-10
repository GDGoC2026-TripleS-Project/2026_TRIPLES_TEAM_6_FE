import {
  scheduleDailyNotification,
  cancelNotification,
} from './notificationScheduler';
import { notificationPresets } from './notificationPresets';

type SyncParams = {
  recordEnabled: boolean;
  recordTime: Date;
  dailyEnabled: boolean;
  dailyTime: Date;
};

export async function syncNotifications({
  recordEnabled,
  recordTime,
  dailyEnabled,
  dailyTime,
}: SyncParams) {
  if (recordEnabled) {
    await scheduleDailyNotification({
      id: notificationPresets.record.id,
      title: notificationPresets.record.title,
      body: notificationPresets.record.body,
      hour: recordTime.getHours(),
      minute: recordTime.getMinutes(),
    });
  } else {
    await cancelNotification(notificationPresets.record.id);
  }

  if (dailyEnabled) {
    await scheduleDailyNotification({
      id: notificationPresets.daily.id,
      title: notificationPresets.daily.title,
      body: notificationPresets.daily.body,
      hour: dailyTime.getHours(),
      minute: dailyTime.getMinutes(),
    });
  } else {
    await cancelNotification(notificationPresets.daily.id);
  }
}
