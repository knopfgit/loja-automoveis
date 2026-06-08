import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, unwrap } from '../../services/api';
import { tokenStore } from '../../services/tokenStore';
import type { Role, User } from '../../types';

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  document: string;
  phone?: string;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  can: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => tokenStore.getUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => tokenStore.getAccessToken());

  const applyAuth = useCallback((payload: AuthResponse) => {
    tokenStore.setTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken });
    tokenStore.setUser(payload.user);
    setAccessToken(payload.accessToken);
    setUser(payload.user);
  }, []);

  const refreshMe = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return;
    const refreshed = await unwrap<AuthResponse>(api.post('/auth/refresh', { refreshToken }));
    applyAuth(refreshed);
    const me = await unwrap<User>(api.get('/auth/me'));
    tokenStore.setUser(me);
    setUser(me);
  }, [applyAuth]);

  useEffect(() => {
    void refreshMe().catch(() => tokenStore.clearTokens());
  }, [refreshMe]);

  const login = useCallback(
    async (input: LoginInput) => {
      const payload = await unwrap<AuthResponse>(api.post('/auth/login', input));
      applyAuth(payload);
    },
    [applyAuth],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const payload = await unwrap<AuthResponse>(api.post('/auth/register', input));
      applyAuth(payload);
    },
    [applyAuth],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.clearTokens();
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshMe,
      can: (roles) => Boolean(user && roles.includes(user.role)),
    }),
    [accessToken, login, logout, refreshMe, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
