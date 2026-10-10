import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthService } from './types';
import { authService } from './index';
import { setOnSessionExpired } from './api';
import { LogoIcon } from '../components/LogoIcon';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithPassword: (i: { identifier: string; password: string }) => Promise<User>;
  requestOtp: (i: { phone: string }) => Promise<{ retryAfter: number }>;
  verifyOtp: (i: { phone: string; code: string }) => Promise<{ user: User; isNewUser?: boolean }>;
  loginWithGoogleCode: (i: { code: string }) => Promise<{ user: User; isNewUser?: boolean }>;
  registerEmail: (i: { email: string; password?: string; captchaToken?: string }) => Promise<{ ok: boolean }>;
  verifyEmailCode: (i: { code: string; email?: string }) => Promise<User>;
  updateUser: (data: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    authService
      .me()
      .then((res) => {
        if (mounted) {
          setUser(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      });

    const handleFocus = () => {
      authService.me().then((res) => {
        if (mounted) setUser(res);
      }).catch(() => {
        if (mounted) setUser(null);
      });
    };

    window.addEventListener('focus', handleFocus);

    setOnSessionExpired(() => {
      if (mounted) {
        setUser(null);
        if (window.location.pathname !== '/') {
          const current = window.location.pathname + window.location.search;
          window.location.href = `/?next=${encodeURIComponent(current)}`;
        }
      }
    });

    return () => {
      mounted = false;
      window.removeEventListener('focus', handleFocus);
      setOnSessionExpired(null);
    };
  }, []);

  const loginWithPassword = useCallback(
    async (params: { identifier: string; password: string }) => {
      const u = await authService.loginWithPassword(params);
      setUser(u);
      return u;
    },
    []
  );

  const requestOtp = useCallback(async (params: { phone: string }) => {
    return await authService.requestOtp(params);
  }, []);

  const verifyOtp = useCallback(async (params: { phone: string; code: string }) => {
    const res = await authService.verifyOtp(params);
    setUser(res.user);
    return res;
  }, []);

  const loginWithGoogleCode = useCallback(async (params: { code: string }) => {
    const res = await authService.loginWithGoogleCode(params);
    setUser(res.user);
    return res;
  }, []);

  const registerEmail = useCallback(async (params: { email: string; password?: string; captchaToken?: string }) => {
    return await authService.registerEmail(params);
  }, []);

  const verifyEmailCode = useCallback(async (params: { code: string; email?: string }) => {
    const u = await authService.verifyEmailCode(params);
    setUser(u);
    return u;
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const u = await authService.updateUser(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        <LogoIcon size={42} ariaHidden={true} />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithPassword,
        requestOtp,
        verifyOtp,
        loginWithGoogleCode,
        registerEmail,
        verifyEmailCode,
        updateUser,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
