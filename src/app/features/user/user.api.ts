import { api } from '../../../lib/api/client';
import { storage } from '../../../utils/storage';
import { storageKeys } from '../../../constants/storageKeys';

type ApiResponse<T> = { data: T };

export type UserMe = {
  id: number;
  nickname: string;
  email?: string;
  profileImageUrl?: string;
  provider?: string;
  socialProvider?: string;
  loginProvider?: string;
  caffeineLimit?: number;
  sugarLimit?: number;
};

export type NotificationSettingsRaw = Record<string, unknown>;
export type GoalsRaw = {
  caffeine?: number;
  sugar?: number;
  caffeineLimit?: number;
  sugarLimit?: number;
};

export type GoalsPeriod = {
  id: number;
  userId: number;
  dailyCaffeineTarget: number;
  dailySugarTarget: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type DevicePlatform = 'ANDROID' | 'IOS';
export type RegisterDeviceTokenPayload = {
  fcmToken: string;
  platform: DevicePlatform;
};

const buildImageFormData = (uri: string) => {
  const name = uri.split('/').pop() ?? `profile-${Date.now()}.jpg`;
  const ext = name.split('.').pop()?.toLowerCase();
  const type =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const form = new FormData();
  form.append('file', { uri, name, type } as any);
  return form;
};

export const userApiLayer = {
  getMe: () => api.get<ApiResponse<UserMe>>('/users/me'),

  updateNickname: (nickname: string) =>
    api.patch<ApiResponse<UserMe>>('/users/me', { nickname }),

  uploadProfileImage: (uri: string) =>
    api.patch<ApiResponse<UserMe>>('/users/me/profile-image', buildImageFormData(uri), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getNotificationSettings: () =>
    api.get<ApiResponse<NotificationSettingsRaw>>('/users/me/notification-settings'),

  updateNotificationSettings: (payload: NotificationSettingsRaw) =>
    api.patch<ApiResponse<NotificationSettingsRaw>>('/users/me/notification-settings', payload),

  getGoals: async (params?: { date?: string }) => {
    const loginId = await storage.get(storageKeys.loginId);
    const query = {
      ...(params?.date ? { date: params.date } : {}),
      ...(loginId ? { loginId } : {}),
    };
    return api.get<ApiResponse<GoalsRaw | GoalsPeriod | GoalsPeriod[]>>(
      '/users/me/goals',
      { params: Object.keys(query).length ? query : undefined }
    );
  },

  updateGoals: async (payload: { caffeine: number; sugar: number; startDate?: string }) => {
    const loginId = await storage.get(storageKeys.loginId);
    return api.patch<ApiResponse<{ caffeine: number; sugar: number }>>(
      '/users/me/goals',
      payload,
      { params: loginId ? { loginId } : undefined }
    );
  },

  registerDeviceToken: (payload: RegisterDeviceTokenPayload) =>
    api.post<ApiResponse<{ success: boolean }>>('/users/me/devices', payload),

  deleteMe: () => api.delete<ApiResponse<{ deleted?: boolean }>>('/users/me'),
};
