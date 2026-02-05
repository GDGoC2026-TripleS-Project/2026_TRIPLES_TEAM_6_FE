import { api } from '../../../lib/api/client';

type ApiResponse<T> = { data: T };

export type UserMe = {
  id: number;
  nickname: string;
  email?: string;
  profileImageUrl?: string;
  provider?: string;
  socialProvider?: string;
  loginProvider?: string;
};

export type NotificationSettingsRaw = Record<string, unknown>;

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

  registerDeviceToken: (token: string) =>
    api.post<ApiResponse<{ registered: boolean }>>('/users/me/devices', { token }),

  deleteMe: () => api.delete<ApiResponse<{ deleted?: boolean }>>('/users/me'),
};
