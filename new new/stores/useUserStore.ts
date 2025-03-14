// src/stores/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  configId: string | null;
  userId: string | null;
  primarySessionId: string | null;
  token: string | null;
  setConfigId: (id: string | null) => void;
  setUserId: (id: string | null) => void;
  setPrimarySessionId: (id: string | null) => void;
  setToken: (token: string | null) => void;
  reset: () => void;
}

// Use persist middleware to save to localStorage
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      configId: null,
      userId: null,
      primarySessionId: null,
      token: null,
      setConfigId: (id) => set({ configId: id }),
      setUserId: (id) => set({ userId: id }),
      setPrimarySessionId: (id) => set({ primarySessionId: id }),
      setToken: (token) => set({ token }),
      reset: () => set({ configId: null, userId: null, primarySessionId: null, token: null }),
    }),
    {
      name: 'user-store', // storage key
    }
  )
);
