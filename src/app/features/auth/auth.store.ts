import { create } from 'zustand';
import { storage } from '../../../utils/storage';
import { storageKeys } from '../../../constants/storageKeys';
import { authApiLayer } from './auth.api';

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
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  errorMessage: undefined,

  hydrate: async () => {
    const [accessToken, refreshToken] = await Promise.all([
      storage.get(storageKeys.accessToken),
      storage.get(storageKeys.refreshToken),
    ]);

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

      if (autoLogin) {
        await Promise.all([
          storage.set(storageKeys.accessToken, tokens.accessToken),
          storage.set(storageKeys.refreshToken, tokens.refreshToken),
          storage.set(storageKeys.autoLogin, 'true'),
        ]);
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
        '로그인에 실패했어요. 아이디/비밀번호를 확인해 주세요.';

      set({ isLoading: false, errorMessage: msg });
      return false;
    }
  },

  logout: async () => {
    await storage.multiRemove([storageKeys.accessToken, storageKeys.refreshToken, storageKeys.autoLogin]);
    set({ user: null, accessToken: null, refreshToken: null });
  },
  signup: async ({ loginId, password, nickname, autoLogin }) => {
    set({ isLoading: true, errorMessage: undefined });

    try {
      const result = await authApiLayer.signup({ loginId, password, nickname });
      const { user, tokens } = result.data.data;

      if (autoLogin) {
        await Promise.all([
          storage.set(storageKeys.accessToken, tokens.accessToken),
          storage.set(storageKeys.refreshToken, tokens.refreshToken),
          storage.set(storageKeys.autoLogin, 'true'),
        ]);
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
}));
