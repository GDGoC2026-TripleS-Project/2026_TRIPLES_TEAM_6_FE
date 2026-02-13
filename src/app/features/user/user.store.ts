import { create } from 'zustand';
import {
  NotificationSettingsRaw,
  UserMe,
  userApiLayer,
} from './user.api';
import { storage } from '../../../utils/storage';
import { storageKeys } from '../../../constants/storageKeys';
import { useGoalStore } from '../../../store/goalStore';

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

const coerceBool = (v: unknown): boolean | undefined => {
  if (typeof v === 'boolean') return v;

  if (typeof v === 'number') {
    if (v === 1) return true;
    if (v === 0) return false;
  }

  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['true', '1', 'y', 'yes', 'on'].includes(s)) return true;
    if (['false', '0', 'n', 'no', 'off'].includes(s)) return false;
  }

  return undefined;
};

const readBool = (raw: NotificationSettingsRaw, keys: string[], fallback: boolean) => {
  for (const key of keys) {
    const coerced = coerceBool((raw as any)[key]);
    if (coerced !== undefined) return coerced;
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
  
  // ✅ 서버의 실제 필드명 사용
  const isEnabled = coerceBool((source as any).isEnabled) ?? true;
  const recordRemindAt = (source as any).recordRemindAt || '14:00:00';
  const dailyCloseAt = (source as any).dailyCloseAt || '21:00:00';

  return {
    settings: {
      // isEnabled가 false면 둘 다 꺼진 것으로 처리 (서버 구조에 따라 조정 필요)
      recordEnabled: isEnabled,
      recordTime: normalizeTime(recordRemindAt, defaultSettings.recordTime),
      dailyEnabled: isEnabled, // ⚠️ 개별 enable이 없으면 isEnabled 공유
      dailyTime: normalizeTime(dailyCloseAt, defaultSettings.dailyTime),
    },
    keys: {
      recordEnabled: 'isEnabled',
      recordTime: 'recordRemindAt',
      dailyEnabled: 'isEnabled', // ⚠️ 서버에 개별 필드가 없으면 공유
      dailyTime: 'dailyCloseAt',
    },
  };
};

const parseStoredNotification = (raw: string | null) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as NotificationSettingsRaw;
    return parseNotification(parsed).settings;
  } catch {
    return null;
  }
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
      const userData = res.data.data;
      if (
        typeof userData?.caffeineLimit === 'number' ||
        typeof userData?.sugarLimit === 'number'
      ) {
        void useGoalStore.getState().setGoalsLocal({
          caffeine: userData?.caffeineLimit ?? useGoalStore.getState().caffeine,
          sugar: userData?.sugarLimit ?? useGoalStore.getState().sugar,
        });
      }
      set({ me: userData, isLoading: false });
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
  set({ isLoading: true });
  try {
    const res = await userApiLayer.getNotificationSettings();
    console.log('📥 GET raw response:', JSON.stringify(res.data, null, 2)); // ✅ 원본 확인
    
    const parsed = parseNotification(res.data.data);
    console.log('📦 Parsed settings:', parsed.settings);
    console.log('🔑 Detected keys:', parsed.keys);
    
    set({
      notificationSettings: parsed.settings,
      notificationKeys: parsed.keys,
      isLoading: false,
    });
    return true;
  } catch (e) {
    if (__DEV__) console.error('fetchNotificationSettings error:', e);
    set({ 
      isLoading: false,
      errorMessage: '알림 설정을 불러오지 못했어요.' 
    });
    return false;
  }
},

  updateNotificationSettings: async (next) => {
  set({ isLoading: true, errorMessage: undefined });
  
  // ✅ 서버가 기대하는 필드명으로 전송
  const payload = {
    isEnabled: next.recordEnabled || next.dailyEnabled, // 하나라도 켜져있으면 true
    recordRemindAt: next.recordTime,
    dailyCloseAt: next.dailyTime,
  };

  try {
    console.log('🔵 PATCH payload:', payload);
    const res = await userApiLayer.updateNotificationSettings(payload);
    console.log('🟢 PATCH response:', JSON.stringify(res.data, null, 2));
    
    console.log('✅ Update success, refetching...');
    await get().fetchNotificationSettings();
    set({ isLoading: false });
    return true;
  } catch (e: any) {
    console.log('🔴 PATCH error:', e.response?.data);
    set({ 
      isLoading: false, 
      errorMessage: e?.response?.data?.message ?? '알림 설정 저장에 실패했어요.' 
    });
    return false;
  }
},

  deleteMe: async () => {
    set({ isLoading: true, errorMessage: undefined });
    try {
      await userApiLayer.deleteMe();
      await Promise.all([
        storage.set(storageKeys.onboardingPending, 'true'),
        storage.remove(storageKeys.onboardingDone),
      ]);
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
