import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from './api';
import * as authService from './auth.service';
import { firebaseAuthService } from '../config/firebase';

export interface User {
  id: string;
  fullName?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  isActive?: boolean;
}

interface AuthContextShape {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { fullName?: string; email: string; phone?: string; password: string; confirmPassword?: string }) => Promise<void>;
  logout: () => void;
  firebaseLogin: (email: string, password: string) => Promise<void>;
  firebaseRegister: (email: string, password: string) => Promise<void>;
  firebaseLoginWithGoogle: () => Promise<void>;
  firebaseLogout: () => Promise<void>;
  firebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function restore() {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthToken(null);
        if (mounted) setLoading(false);
        return;
      }
      setAuthToken(token);
      try {
        const u = await authService.me();
        if (!mounted) return;
        setUser(u as User);
      } catch {
        localStorage.removeItem('auth_token');
        setAuthToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restore();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (!result) throw new Error('Login failed');
    const { token, user: u } = result as { token: string; user: User };
    localStorage.setItem('auth_token', token);
    setAuthToken(token);
    setUser(u as User);
  };

  const register = async (payload: { fullName?: string; email: string; phone?: string; password: string; confirmPassword?: string }) => {
    const result = await authService.register(payload);
    if (!result) throw new Error('Register failed');
    const { token, user: u } = result as { token: string; user: User };
    localStorage.setItem('auth_token', token);
    setAuthToken(token);
    setUser(u as User);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
        setAuthToken(null);
        setUser(null);
  };

  const firebaseLogin = async (email: string, password: string) => {
    const firebaseUser = await firebaseAuthService.signInWithEmail(email, password);
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email ?? email,
      fullName: firebaseUser.displayName ?? null,
      role: 'customer',
      isActive: true,
    });
  };

  const firebaseRegister = async (email: string, password: string) => {
    const firebaseUser = await firebaseAuthService.signUpWithEmail(email, password);
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email ?? email,
      fullName: firebaseUser.displayName ?? null,
      role: 'customer',
      isActive: true,
    });
  };

  const firebaseLoginWithGoogle = async () => {
    const firebaseUser = await firebaseAuthService.signInWithGoogle();
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email ?? 'google-user@example.com',
      fullName: firebaseUser.displayName ?? null,
      role: 'customer',
      isActive: true,
    });
  };

  const firebaseLogout = async () => {
    await firebaseAuthService.signOut();
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, firebaseLogin, firebaseRegister, firebaseLoginWithGoogle, firebaseLogout, firebaseEnabled: firebaseAuthService.isEnabled }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
