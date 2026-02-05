import { create } from 'zustand';
import {
  NotificationSettingsRaw,
  UserMe,
  userApiLayer,
} from './user.api';

export type NotificationSettings = {
  recordEnabled: boolean;
  recordTime: string;
  dailyEnabled: boolean;
  dailyTime: string;
};

type NotificationKeyMap = {
  recordEnabled: string;
  recordTime: string;
  dailyEnabled: string;
  dailyTime: string;
};

type UserState = {
  me: UserMe | null;
  notificationSettings: NotificationSettings | null;
  notificationKeys: NotificationKeyMap;
  isLoading: boolean;
  errorMessage?: string;

  fetchMe: () => Promise<boolean>;
  updateNickname: (nickname: string) => Promise<boolean>;
  uploadProfileImage: (uri: string) => Promise<boolean>;
  fetchNotificationSettings: () => Promise<boolean>;
  updateNotificationSettings: (next: NotificationSettings) => Promise<boolean>;
  deleteMe: () => Promise<boolean>;
  clear: () => void;
};

const defaultSettings: NotificationSettings = {
  recordEnabled: false,
  recordTime: '14:00',
  dailyEnabled: false,
  dailyTime: '21:00',
};

const defaultKeys: NotificationKeyMap = {
  recordEnabled: 'recordEnabled',
  recordTime: 'recordTime',
  dailyEnabled: 'dailyEnabled',
  dailyTime: 'dailyTime',
};

const readBool = (raw: NotificationSettingsRaw, keys: string[], fallback: boolean) => {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'boolean') return value;
  }
  return fallback;
};

const readString = (raw: NotificationSettingsRaw, keys: string[], fallback: string) => {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
};

const readKey = (raw: NotificationSettingsRaw, keys: string[], fallback: string) => {
  for (const key of keys) {
    if (key in raw) return key;
  }
  return fallback;
};

const normalizeTime = (value: string, fallback: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (Number.isNaN(hh) || Number.isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    return fallback;
  }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

const parseNotification = (raw?: NotificationSettingsRaw) => {
  const source = raw ?? {};
  const recordEnabledKeys = ['recordEnabled', 'recordNotificationEnabled', 'intakeReminderEnabled'];
  const recordTimeKeys = ['recordTime', 'recordNotificationTime', 'intakeReminderTime'];
  const dailyEnabledKeys = ['dailyEnabled', 'dailyNotificationEnabled', 'summaryReminderEnabled'];
  const dailyTimeKeys = ['dailyTime', 'dailyNotificationTime', 'summaryReminderTime'];

  return {
    settings: {
      recordEnabled: readBool(source, recordEnabledKeys, defaultSettings.recordEnabled),
      recordTime: normalizeTime(
        readString(source, recordTimeKeys, defaultSettings.recordTime),
        defaultSettings.recordTime
      ),
      dailyEnabled: readBool(source, dailyEnabledKeys, defaultSettings.dailyEnabled),
      dailyTime: normalizeTime(
        readString(source, dailyTimeKeys, defaultSettings.dailyTime),
        defaultSettings.dailyTime
      ),
    },
    keys: {
      recordEnabled: readKey(source, recordEnabledKeys, defaultKeys.recordEnabled),
      recordTime: readKey(source, recordTimeKeys, defaultKeys.recordTime),
      dailyEnabled: readKey(source, dailyEnabledKeys, defaultKeys.dailyEnabled),
      dailyTime: readKey(source, dailyTimeKeys, defaultKeys.dailyTime),
    },
  };
};

export const useUserStore = create<UserState>((set, get) => ({
  me: null,
  notificationSettings: null,
  notificationKeys: defaultKeys,
  isLoading: false,
  errorMessage: undefined,

  fetchMe: async () => {
    set({ isLoading: true, errorMessage: undefined });
    try {
      const res = await userApiLayer.getMe();
      set({ me: res.data.data, isLoading: false });
      return true;
    } catch (e: any) {
      set({
        isLoading: false,
        errorMessage: e?.response?.data?.message ?? e?.message ?? '내 정보를 불러오지 못했어요.',
      });
      return false;
    }
  },

  updateNickname: async (nickname: string) => {
    set({ isLoading: true, errorMessage: undefined });
    try {
      const res = await userApiLayer.updateNickname(nickname);
      set((state) => ({
        me: state.me ? { ...state.me, ...res.data.data } : res.data.data,
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      set({
        isLoading: false,
        errorMessage: e?.response?.data?.message ?? e?.message ?? '닉네임 변경에 실패했어요.',
      });
      return false;
    }
  },

  uploadProfileImage: async (uri: string) => {
    set({ isLoading: true, errorMessage: undefined });
    try {
      const res = await userApiLayer.uploadProfileImage(uri);
      set((state) => {
        const fallbackMe = state.me ? { ...state.me, profileImageUrl: uri } : state.me;
        return {
          me: res.data.data ? { ...(fallbackMe ?? {}), ...res.data.data } : fallbackMe,
          isLoading: false,
        };
      });
      return true;
    } catch (e: any) {
      set({
        isLoading: false,
        errorMessage: e?.response?.data?.message ?? e?.message ?? '프로필 이미지 업로드에 실패했어요.',
      });
      return false;
    }
  },

  fetchNotificationSettings: async () => {
    set({ isLoading: true, errorMessage: undefined });
    try {
      const res = await userApiLayer.getNotificationSettings();
      const parsed = parseNotification(res.data.data);
      set({
        notificationSettings: parsed.settings,
        notificationKeys: parsed.keys,
        isLoading: false,
      });
      return true;
    } catch (e: any) {
      const fallback = parseNotification(undefined);
      set({
        notificationSettings: fallback.settings,
        notificationKeys: fallback.keys,
        isLoading: false,
        errorMessage:
          e?.response?.data?.message ?? e?.message ?? '알림 설정을 불러오지 못했어요.',
      });
      return false;
    }
  },

  updateNotificationSettings: async (next) => {
    set({ isLoading: true, errorMessage: undefined });
    const keys = get().notificationKeys;
    const payload: NotificationSettingsRaw = {
      [keys.recordEnabled]: next.recordEnabled,
      [keys.recordTime]: next.recordTime,
      [keys.dailyEnabled]: next.dailyEnabled,
      [keys.dailyTime]: next.dailyTime,
    };

    try {
      const res = await userApiLayer.updateNotificationSettings(payload);
      const parsed = parseNotification((res.data.data ?? payload) as NotificationSettingsRaw);
      set({
        notificationSettings: parsed.settings,
        notificationKeys: parsed.keys,
        isLoading: false,
      });
      return true;
    } catch (e: any) {
      set({
        isLoading: false,
        errorMessage:
          e?.response?.data?.message ?? e?.message ?? '알림 설정 저장에 실패했어요.',
      });
      return false;
    }
  },

  deleteMe: async () => {
    set({ isLoading: true, errorMessage: undefined });
    try {
      await userApiLayer.deleteMe();
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({
        isLoading: false,
        errorMessage: e?.response?.data?.message ?? e?.message ?? '회원 탈퇴에 실패했어요.',
      });
      return false;
    }
  },

  clear: () => {
    set({
      me: null,
      notificationSettings: null,
      notificationKeys: defaultKeys,
      isLoading: false,
      errorMessage: undefined,
    });
  },
}));
