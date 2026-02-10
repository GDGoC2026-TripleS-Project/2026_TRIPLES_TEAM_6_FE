import { NOTIFICATION_IDS } from './notificationIds';

export const notificationPresets = {
  record: {
    id: NOTIFICATION_IDS.RECORD_REMIND,
    title: '기록할 시간이에요 ☕️',
    body: '오늘 마신 음료를 기록해보세요.',
  },
  daily: {
    id: NOTIFICATION_IDS.DAILY_CLOSE,
    title: '하루 마무리 🌙',
    body: '오늘의 기록을 확인해보세요.',
  },
};
