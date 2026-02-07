import { api, authApi } from "../../../lib/api/client";

type ApiResponse<T> = { data: T };

type AuthTokens = { accessToken: string; refreshToken: string };
type UserSummary = { id: number; nickname: string };

type LoginRes = ApiResponse<{ user: UserSummary; tokens: AuthTokens }>;
type SignupRes = ApiResponse<{ user: UserSummary; tokens: AuthTokens }>;
type RefreshRes = ApiResponse<{ accessToken: string; refreshToken: string }>;
type LogoutRes = ApiResponse<{ loggedOut: boolean }>;
type AvailabilityRes = ApiResponse<{ isAvailable?: boolean; available?: boolean }>;
type PasswordResetRequestRes = ApiResponse<{ requested?: boolean }>;
type PasswordResetConfirmRes = ApiResponse<{ reset?: boolean }>;
export type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';
export type SocialLoginPayload = {
  provider: SocialProvider;
  providerToken: string;
  email?: string;
};

export const authApiLayer = {
  login: (payload: { loginId: string; password: string }) =>
    authApi.post<LoginRes>('/auth/login', payload),

  signup: (payload: { loginId: string; password: string; nickname: string; email: string }) =>
    authApi.post<SignupRes>('/auth/signup', payload),

  checkLoginId: (loginId: string) =>
    authApi.get<AvailabilityRes>('/auth/check-login-id', {
      params: { loginId },
    }),

  checkNickname: (nickname: string) =>
    authApi.get<AvailabilityRes>('/auth/check-nickname', {
      params: { nickname },
    }),

  refresh: (refreshToken: string) =>
    authApi.post<RefreshRes>('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),

  logout: (refreshToken: string) =>
    authApi.post<LogoutRes>('/auth/logout', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),

  socialLogin: ({ provider, ...body }: SocialLoginPayload) =>
    authApi.post(`/auth/social/${provider}/login`, body),

  requestPasswordReset: (payload: { loginId: string; email: string }) =>
    authApi.post<PasswordResetRequestRes>('/auth/password-reset/request', payload),

  confirmPasswordReset: (payload: { loginId: string; newPassword: string; token: string }) =>
    authApi.post<PasswordResetConfirmRes>('/auth/password-reset/confirm', payload),

  // 보호 API 예시는 api 사용
  // getMe: () => api.get<UserMeRes>('/users/me'),
};
