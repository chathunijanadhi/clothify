import api from './api';

export interface PublicUser {
  id: string;
  fullName?: string | null;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const register = async (payload: { fullName?: string; email: string; phone?: string; password: string; confirmPassword?: string }) => {
  const res = await api.post('/auth/register', payload);
  // backend returns { success, message, data: { user, token } }
  return res.data?.data ?? null;
};

export const login = async (payload: { email: string; password: string }) => {
  const res = await api.post('/auth/login', payload);
  return res.data?.data ?? null;
};

export const me = async () => {
  const res = await api.get('/auth/me');
  return res.data?.data?.user ?? null;
};
