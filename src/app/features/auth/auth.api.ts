import { api, authApi } from "../../../lib/api/client";

type ApiResponse<T> = { data: T };

type AuthTokens = { accessToken: string; refreshToken: string };
type UserSummary = { id: number; nickname: string };

type LoginRes = ApiResponse<{ user: UserSummary; tokens: AuthTokens }>;
type SignupRes = ApiResponse<{ user: UserSummary; tokens: AuthTokens }>;
type RefreshRes = ApiResponse<{ accessToken: string; refreshToken: string }>;
type LogoutRes = ApiResponse<{ loggedOut: boolean }>;
type AvailabilityRes = ApiResponse<{ isAvailable?: boolean; available?: boolean }>;

export const authApiLayer = {
  login: (payload: { loginId: string; password: string }) =>
    authApi.post<LoginRes>('/auth/login', payload),

  signup: (payload: { loginId: string; password: string; nickname: string }) =>
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

  socialLogin: (args: { provider: 'KAKAO' | 'GOOGLE' | 'APPLE'; providerAccessToken: string }) =>
    authApi.post(`/auth/social/${args.provider}/login`, {
      providerAccessToken: args.providerAccessToken,
    }),

  // 보호 API 예시는 api 사용
  // getMe: () => api.get<UserMeRes>('/users/me'),
};
