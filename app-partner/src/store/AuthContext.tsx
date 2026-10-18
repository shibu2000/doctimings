import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PartnerAccount, PartnerUser } from '../types';
import { api } from '../services/api';

type AuthResult = { success: boolean; error?: string };

interface AuthContextType {
  user: PartnerUser | null;
  account: PartnerAccount | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  activate: (data: { code: string; name: string; email: string; phone: string; password: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  account: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  activate: async () => ({ success: false }),
  logout: async () => {},
  refreshAccount: async () => {},
});

const NOT_A_PARTNER = 'This app is for establishment owners, counter staff and doctors. DocTimings team members should use the admin panel.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PartnerUser | null>(null);
  const [account, setAccount] = useState<PartnerAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setAccount(null);
  }, []);

  const loadAccount = useCallback(async (): Promise<AuthResult> => {
    const res = await api.getAccount();
    if (!res.success || !res.data) return { success: false, error: res.error?.message };
    if (res.data.user.role !== 'Partner') return { success: false, error: NOT_A_PARTNER };
    setAccount(res.data);
    return { success: true };
  }, []);

  useEffect(() => {
    api.onUnauthorized(() => {
      logout();
    });
    return () => api.onUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await api.initToken();
        if (!saved) return;
        const me = await api.getMe();
        if (me.success && me.data && me.data.role === 'Partner' && (await loadAccount()).success) {
          setUser(me.data);
        } else if (me.error) {
          await logout();
        }
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, [loadAccount, logout]);

  const finishSignIn = async (sessionUser: PartnerUser): Promise<AuthResult> => {
    if (sessionUser.role !== 'Partner') {
      await logout();
      return { success: false, error: NOT_A_PARTNER };
    }
    const loaded = await loadAccount();
    if (!loaded.success) {
      await logout();
      return loaded;
    }
    setUser(sessionUser);
    return { success: true };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const res = await api.login(email.trim(), password);
    if (!res.success || !res.data) return { success: false, error: res.error?.message || 'Sign in failed' };
    return finishSignIn(res.data.user);
  };

  const activate = async (data: { code: string; name: string; email: string; phone: string; password: string }): Promise<AuthResult> => {
    const res = await api.activate(data);
    if (!res.success || !res.data) return { success: false, error: res.error?.message || 'Activation failed' };
    return finishSignIn(res.data.user);
  };

  const refreshAccount = useCallback(async () => {
    await loadAccount();
  }, [loadAccount]);

  return (
    <AuthContext.Provider
      value={{ user, account, isLoading, isAuthenticated: Boolean(user && account), login, activate, logout, refreshAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
