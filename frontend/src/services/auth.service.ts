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

/**
 * Exchange a Firebase user object for a backend JWT.
 * Called after any Firebase login/registration to get access to protected APIs.
 */
export const firebaseAuthWithBackend = async (firebaseUser: { uid: string; email: string; displayName?: string | null }) => {
  const res = await api.post('/auth/firebase', {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName ?? null,
  });
  return res.data?.data ?? null;
};

