import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost, apiPut } from '@/lib/api';
import {
  deleteRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from '@/lib/secureRefreshToken';
import { router } from 'expo-router';

export interface User {
  id: string;
  email: string;
  name: string;
  monthlyIncome?: number | null;
  currency: string;
  createdAt: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  monthlyIncome?: number;
  currency?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'name' | 'monthlyIncome' | 'currency'>>) => Promise<void>;
  initialize: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearError: () => void;
}

type AuthPayload = {
  user: User;
  tokens: { accessToken: string; refreshToken: string };
};

function apiErrMessage(err: unknown): string {
  const e = err as { response?: { data?: { error?: string; message?: string } } };
  return e.response?.data?.error ?? e.response?.data?.message ?? 'Something went wrong';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setTokens: (accessToken: string, refreshToken: string) => {
        void setRefreshToken(refreshToken);
        set({ accessToken, refreshToken });
      },

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiPost<AuthPayload>('/auth/login', { email, password });
          await setRefreshToken(data.tokens.refreshToken);
          set({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          router.replace('/(tabs)/home');
        } catch (err) {
          set({
            isLoading: false,
            error: apiErrMessage(err),
          });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPost<AuthPayload>('/auth/register', data);
          await setRefreshToken(res.tokens.refreshToken);
          set({
            accessToken: res.tokens.accessToken,
            refreshToken: res.tokens.refreshToken,
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
          });
          router.replace('/(auth)/onboarding');
        } catch (err) {
          set({
            isLoading: false,
            error: apiErrMessage(err),
          });
        }
      },

      logout: () => {
        void deleteRefreshToken();
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
        router.replace('/(auth)/login');
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        try {
          const data = await apiPost<AuthPayload>('/auth/refresh', { refreshToken });
          await setRefreshToken(data.tokens.refreshToken);
          set({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
          });
        } catch {
          get().logout();
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true });
        try {
          const user = await apiPut<User>('/users/profile', updates);
          set({ user, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: apiErrMessage(err),
          });
          throw err;
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          const storedRefresh = await getRefreshToken();
          if (!storedRefresh) {
            set({ isLoading: false });
            return;
          }
          const data = await apiPost<AuthPayload>('/auth/refresh', {
            refreshToken: storedRefresh,
          });
          await setRefreshToken(data.tokens.refreshToken);
          set({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          await deleteRefreshToken();
          set({ isLoading: false, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
