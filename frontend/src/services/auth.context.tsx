import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from './api';
import * as authService from './auth.service';

export interface User {
  id: string;
  fullName?: string | null;
  email: string;
  role: string;
  isActive?: boolean;
}

interface AuthContextShape {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { fullName?: string; email: string; phone?: string; password: string; confirmPassword?: string }) => Promise<void>;
  logout: () => void;
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
        if (mounted) setLoading(false);
        return;
      }
      // set axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const u = await authService.me();
        if (!mounted) return;
        setUser(u as any);
      } catch (err) {
        // failed to restore token — clear it
        localStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
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
    const { token, user: u } = result as any;
    // persist token and set header
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(u as User);
  };

  const register = async (payload: { fullName?: string; email: string; phone?: string; password: string; confirmPassword?: string }) => {
    const result = await authService.register(payload);
    if (!result) throw new Error('Register failed');
    const { token, user: u } = result as any;
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(u as User);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
