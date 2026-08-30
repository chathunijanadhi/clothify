import { initializeApp } from 'firebase/app';
import {
  getAuth,
  type User,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const hasFirebaseConfig = requiredFirebaseEnvKeys.every((key) => Boolean(import.meta.env[key]));

export const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export const isFirebaseEnabled = Boolean(firebaseAuth);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const firebaseAuthService = {
  isEnabled: isFirebaseEnabled,
  getCurrentUser: (): User | null => firebaseAuth?.currentUser ?? null,
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!firebaseAuth) {
      callback(null);
      return () => undefined;
    }
    return onAuthStateChanged(firebaseAuth, callback);
  },
  signInWithEmail: async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase auth is not configured. Add VITE_FIREBASE_* values to your frontend .env file.');
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return result.user;
  },
  signUpWithEmail: async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase auth is not configured. Add VITE_FIREBASE_* values to your frontend .env file.');
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return result.user;
  },
  signInWithGoogle: async () => {
    if (!firebaseAuth) throw new Error('Firebase auth is not configured. Add VITE_FIREBASE_* values to your frontend .env file.');
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return result.user;
  },
  signOut: async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
  },
};
