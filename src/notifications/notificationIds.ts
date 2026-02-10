export const NOTIFICATION_IDS = {
  RECORD_REMIND: 'record-remind',
  DAILY_CLOSE: 'daily-close',
} as const;

export type NotificationId =
  | typeof NOTIFICATION_IDS.RECORD_REMIND
  | typeof NOTIFICATION_IDS.DAILY_CLOSE;
