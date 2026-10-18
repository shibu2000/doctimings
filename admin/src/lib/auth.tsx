import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, onUnauthorized, sessionStore } from './api';
import { STAFF_ROLES } from './constants';
import type { User } from './types';

interface AuthState {
  user: User | null;
  checking: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

const canUsePanel = (user: User) => (STAFF_ROLES as readonly string[]).includes(user.role);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const client = useQueryClient();
  const [user, setUser] = useState<User | null>(() => sessionStore.read()?.user ?? null);
  const [checking, setChecking] = useState(() => Boolean(sessionStore.read()));

  const signOut = useCallback(() => {
    sessionStore.clear();
    client.clear();
    setUser(null);
  }, [client]);

  useEffect(() => onUnauthorized(signOut), [signOut]);

  useEffect(() => {
    const stored = sessionStore.read();
    if (!stored) return;
    api
      .me()
      .then(fresh => {
        if (!canUsePanel(fresh) || fresh.status !== 'Active') return signOut();
        sessionStore.write({ token: stored.token, user: fresh });
        setUser(fresh);
      })
      .catch(() => undefined)
      .finally(() => setChecking(false));
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    if (!canUsePanel(session.user)) {
      throw new Error('This account does not have access to the admin panel.');
    }
    sessionStore.write(session);
    setUser(session.user);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      checking,
      signIn,
      signOut,
      isSuperAdmin: user?.role === 'Super Admin',
      isAdmin: Boolean(user && user.role !== 'Staff' && user.role !== 'Patient')
    }),
    [user, checking, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
