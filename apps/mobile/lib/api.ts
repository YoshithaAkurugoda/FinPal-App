import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use((response) => {
  const body = response.data;
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    (body as { success: boolean }).success === true &&
    'data' in body
  ) {
    response.data = (body as { data: unknown }).data;
  }
  return response;
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        const body = data as {
          success?: boolean;
          data?: { tokens?: { accessToken: string; refreshToken: string } };
          tokens?: { accessToken: string; refreshToken: string };
        };
        const inner = body.success && body.data ? body.data : body;
        const access = inner.tokens?.accessToken;
        const refresh = inner.tokens?.refreshToken;
        if (!access || !refresh) throw new Error('Invalid refresh response');
        setTokens(access, refresh);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await api.get<T>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post<T>(url, body);
  return data;
}

export async function apiPut<T>(url: string, body?: unknown) {
  const { data } = await api.put<T>(url, body);
  return data;
}

export async function apiPatch<T>(url: string, body?: unknown) {
  const { data } = await api.patch<T>(url, body);
  return data;
}

export async function apiDelete<T = void>(url: string) {
  const { data } = await api.delete<T>(url);
  return data;
}
