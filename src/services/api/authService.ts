// ─── Auth Service (Mock Mode) ─────────────────────────────────────────────────
// Backend hazır olmadığı için tüm işlemler mock verilerle çalışır.
// Backend hazır olduğunda aşağıdaki USE_MOCK_AUTH = false yapın.

import { AuthTokens, User } from '../../types';
import { MOCK_USER, MOCK_TOKENS } from './mockData';

const USE_MOCK_AUTH = true; // Backend hazır olunca false yapın
const AUTH_TIMEOUT_MS = 5000; // 5 saniye timeout

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Auth isteği zaman aşımına uğradı')), ms),
    ),
  ]);
}

// Gerçek API çağrıları (USE_MOCK_AUTH = false olduğunda aktif olur)
async function realLogin(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
  const { apiClient } = await import('./client');
  return apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/login', { email, password });
}

async function realRegister(email: string, password: string, displayName: string): Promise<{ user: User; tokens: AuthTokens }> {
  const { apiClient } = await import('./client');
  return apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/register', { email, password, displayName });
}

async function realRefreshToken(token: string): Promise<{ accessToken: string }> {
  const { apiClient } = await import('./client');
  return apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken: token });
}

async function realLogout(): Promise<void> {
  const { apiClient } = await import('./client');
  await apiClient.post<void>('/auth/logout', {});
}

// ─── Mock Implementations ─────────────────────────────────────────────────────

async function mockLogin(email: string, _password: string): Promise<{ user: User; tokens: AuthTokens }> {
  await new Promise(r => setTimeout(() => r(undefined), 400)); // Gerçekçi gecikme simülasyonu
  if (!email.includes('@')) {
    throw new Error('Geçersiz e-posta adresi');
  }
  return { user: { ...MOCK_USER, email }, tokens: MOCK_TOKENS };
}

async function mockRegister(email: string, _password: string, displayName: string): Promise<{ user: User; tokens: AuthTokens }> {
  await new Promise(r => setTimeout(() => r(undefined), 500));
  return { user: { ...MOCK_USER, email, displayName }, tokens: MOCK_TOKENS };
}

async function mockRefreshToken(_token: string): Promise<{ accessToken: string }> {
  await new Promise(r => setTimeout(() => r(undefined), 200));
  return { accessToken: MOCK_TOKENS.accessToken };
}

async function mockLogout(): Promise<void> {
  await new Promise(r => setTimeout(() => r(undefined), 200));
}

// ─── Public Service ───────────────────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const fn = USE_MOCK_AUTH ? mockLogin(email, password) : realLogin(email, password);
    return withTimeout(fn, AUTH_TIMEOUT_MS);
  },

  async register(email: string, password: string, displayName: string): Promise<{ user: User; tokens: AuthTokens }> {
    const fn = USE_MOCK_AUTH ? mockRegister(email, password, displayName) : realRegister(email, password, displayName);
    return withTimeout(fn, AUTH_TIMEOUT_MS);
  },

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const fn = USE_MOCK_AUTH ? mockRefreshToken(token) : realRefreshToken(token);
    return withTimeout(fn, AUTH_TIMEOUT_MS);
  },

  async logout(): Promise<void> {
    const fn = USE_MOCK_AUTH ? mockLogout() : realLogout();
    return withTimeout(fn, AUTH_TIMEOUT_MS);
  },
};
