import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthCredentials, RedmineUser } from '@/types/redmine';

interface AuthState {
  redmineUrl: string;
  apiKey: string;
  user: RedmineUser | null;
  isAuthenticated: boolean;
  setCredentials: (creds: AuthCredentials, user: RedmineUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      redmineUrl: '',
      apiKey: '',
      user: null,
      isAuthenticated: false,
      setCredentials: (creds, user) =>
        set({
          redmineUrl: creds.redmineUrl,
          apiKey: creds.apiKey,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          redmineUrl: '',
          apiKey: '',
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'redmine-auth',
    }
  )
);
