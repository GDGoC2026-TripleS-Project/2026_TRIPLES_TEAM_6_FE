import { create } from 'zustand';
import { storage } from '../../../utils/storage';
import { storageKeys } from '../../../constants/storageKeys';
import { authApiLayer, SocialLoginPayload } from './auth.api';
import { useUserStore } from '../user/user.store';

const hasText = (value?: string) => Boolean(value?.trim());

const validateSocialPayload = (payload: SocialLoginPayload) => {
  
  if (!payload.provider) {
    return 'Social provider is required.';
  }

  if (!hasText(payload.providerToken)) {
    return 'providerToken is required.';
  }

  return undefined;
};


type AuthState = {
  user: { id: number; nickname: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  errorMessage?: string;

  login: (args: { loginId: string; password: string; autoLogin: boolean }) => Promise<boolean>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  signup: (args: { loginId: string; password: string; nickname: string; autoLogin: boolean }) => Promise<boolean>;
  checkLoginIdAvailable: (loginId: string) => Promise<{ ok: boolean; message?: string }>;
  checkNicknameAvailable: (nickname: string) => Promise<{ ok: boolean; message?: string }>;
  socialLogin: (args: SocialLoginPayload & { autoLogin?: boolean }) => Promise<boolean>;

};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  errorMessage: undefined,

  hydrate: async () => {
    const [accessToken, refreshToken, autoLogin] = await Promise.all([
      storage.get(storageKeys.accessToken),
      storage.get(storageKeys.refreshToken),
      storage.get(storageKeys.autoLogin),
    ]);

    if (autoLogin !== 'true') {
      await storage.multiRemove([
        storageKeys.accessToken,
        storageKeys.refreshToken,
        storageKeys.autoLogin,
      ]);
      set({ accessToken: null, refreshToken: null, user: null });
      return;
    }

    const decodeJwtPayload = (token: string): { exp?: number } | null => {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      try {
        if (typeof globalThis.atob === 'function') {
          return JSON.parse(globalThis.atob(padded)) as { exp?: number };
        }
        if (typeof Buffer !== 'undefined') {
          return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as { exp?: number };
        }
      } catch (e) {
        if (__DEV__) console.log('[JWT DECODE ERROR]', e);
      }
      return null;
    };

    const isTokenExpired = (token: string, skewSeconds = 30): boolean => {
      const payload = decodeJwtPayload(token);
      if (!payload?.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now + skewSeconds;
    };

    const shouldRefresh =
      Boolean(refreshToken) && (!accessToken || (accessToken && isTokenExpired(accessToken)));

    if (shouldRefresh && refreshToken) {
      try {
        const res = await authApiLayer.refresh(refreshToken);
        const newAccess = res.data?.data?.accessToken;
        const newRefresh = res.data?.data?.refreshToken ?? refreshToken;

        if (!newAccess) throw new Error('refresh response missing accessToken');

        await Promise.all([
          storage.set(storageKeys.accessToken, newAccess),
          storage.set(storageKeys.refreshToken, newRefresh),
        ]);

        set({
          accessToken: newAccess,
          refreshToken: newRefresh,
        });
        return;
      } catch (e) {
        if (__DEV__) console.log('[HYDRATE REFRESH ERROR]', e);
        await storage.multiRemove([
          storageKeys.accessToken,
          storageKeys.refreshToken,
          storageKeys.autoLogin,
        ]);
        set({ accessToken: null, refreshToken: null, user: null });
        return;
      }
    }

    set({
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
    });
  },

  login: async ({ loginId, password, autoLogin }) => {
    set({ isLoading: true, errorMessage: undefined });

    try {
      const result = await authApiLayer.login({ loginId, password });
      const { user, tokens } = result.data.data;

      await Promise.all([
        storage.set(storageKeys.accessToken, tokens.accessToken),
        storage.set(storageKeys.refreshToken, tokens.refreshToken),
      ]);
      if (autoLogin) {
        await storage.set(storageKeys.autoLogin, 'true');
      } else {
        await storage.remove(storageKeys.autoLogin);
      }

      console.log('[LOGIN RES]', result.data);
console.log('[LOGIN DATA]', result.data.data);
console.log('[LOGIN USER]', user);
console.log('[LOGIN TOKENS]', tokens);

      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isLoading: false,
      });

      return true;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        '로그인에 실패했어요. 아이디/비밀번호를 확인해 주세요.';

      set({ isLoading: false, errorMessage: msg });
      return false;
    }
  },

  logout: async () => {
    const refreshToken = get().refreshToken ?? (await storage.get(storageKeys.refreshToken));
    try {
      if (refreshToken) {
        await authApiLayer.logout(refreshToken);
      }
    } catch (e) {
      if (__DEV__) console.log('[LOGOUT API ERROR]', e);
    }

    await storage.multiRemove([storageKeys.accessToken, storageKeys.refreshToken, storageKeys.autoLogin]);
    set({ user: null, accessToken: null, refreshToken: null });
    useUserStore.getState().clear();
  },
  signup: async ({ loginId, password, nickname, autoLogin }) => {
    set({ isLoading: true, errorMessage: undefined });

    try {
      const result = await authApiLayer.signup({ loginId, password, nickname });
      const { user, tokens } = result.data.data;

      await Promise.all([
        storage.set(storageKeys.accessToken, tokens.accessToken),
        storage.set(storageKeys.refreshToken, tokens.refreshToken),
      ]);
      if (autoLogin) {
        await storage.set(storageKeys.autoLogin, 'true');
      } else {
        await storage.remove(storageKeys.autoLogin);
      }

      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isLoading: false,
      });

      return true;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        '회원가입에 실패했어요. 입력값을 확인해 주세요.';

      set({ isLoading: false, errorMessage: msg });
      return false;
    }
  },

  checkLoginIdAvailable: async (loginId: string) => {
    try {
      const res = await authApiLayer.checkLoginId(loginId);
      const available = res.data?.data?.isAvailable ?? res.data?.data?.available;

      return { ok: typeof available === 'boolean' ? available : true };
    } catch (e: any) {
      return {
        ok: false,
        message: e?.response?.data?.message ?? e?.message ?? '?꾩씠?붽? ?대? ?ъ슜 以묒엯?덈떎.',
      };
    }
  },

  checkNicknameAvailable: async (nickname: string) => {
    try {
      const res = await authApiLayer.checkNickname(nickname);
      const available = res.data?.data?.isAvailable ?? res.data?.data?.available;

      return { ok: typeof available === 'boolean' ? available : true };
    } catch (e: any) {
      return {
        ok: false,
        message: e?.response?.data?.message ?? e?.message ?? '?됰꽕?꾩씠 ?대? ?ъ슜 以묒엯?덈떎.',
      };
    }
  },

  socialLogin: async ({ autoLogin, ...payload }) => {
  set({ isLoading: true, errorMessage: undefined });

  try {
    const validationError = validateSocialPayload(payload);
    if (validationError) {
      throw new Error(validationError);
    }

    const result = await authApiLayer.socialLogin(payload);
    const { user, tokens } = result.data.data;

    await Promise.all([
      storage.set(storageKeys.accessToken, tokens.accessToken),
      storage.set(storageKeys.refreshToken, tokens.refreshToken),
    ]);
    if (autoLogin) {
      await storage.set(storageKeys.autoLogin, 'true');
    } else {
      await storage.remove(storageKeys.autoLogin);
    }

    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isLoading: false,
    });

    return true;
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.message ??
      '소셜 로그인에 실패했어요. 다시 시도해 주세요.';
    set({ isLoading: false, errorMessage: msg });
    return false;
  }
},

}));
