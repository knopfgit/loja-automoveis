import type { User } from '../types';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

let accessToken: string | null = null;
const refreshKey = 'coser.refreshToken';
const userKey = 'coser.user';

export const tokenStore = {
  getAccessToken() {
    return accessToken;
  },
  getRefreshToken() {
    return sessionStorage.getItem(refreshKey);
  },
  setTokens(tokens: TokenPair) {
    accessToken = tokens.accessToken;
    sessionStorage.setItem(refreshKey, tokens.refreshToken);
  },
  clearTokens() {
    accessToken = null;
    sessionStorage.removeItem(refreshKey);
    sessionStorage.removeItem(userKey);
  },
  setUser(user: User) {
    sessionStorage.setItem(userKey, JSON.stringify(user));
  },
  getUser(): User | null {
    const raw = sessionStorage.getItem(userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
};
