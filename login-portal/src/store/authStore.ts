// ============================================================
// AUTH STORE — Zustand global state
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;

  setAuth: (params: {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string;
    sessionId?: string;
  }) => void;
  clearAuth: () => void;
  updateToken: (accessToken: string, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      isAuthenticated: false,

      setAuth: ({ user, accessToken, refreshToken, sessionId }) => {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          sessionId: sessionId ?? null,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          sessionId: null,
          isAuthenticated: false,
        });
      },

      updateToken: (accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        set((s) => ({
          ...s,
          accessToken,
          ...(refreshToken ? { refreshToken } : {}),
        }));
      },
    }),
    {
      name: "labcore-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        sessionId: s.sessionId,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
