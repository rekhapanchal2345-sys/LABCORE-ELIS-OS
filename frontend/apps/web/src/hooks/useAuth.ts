"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AuthUser,
  AuthSession,
  RegisterData,
  clearAuthSession,
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
  login,
  logout,
  register,
  hasRole,
  hasAnyRole,
  isPrivacyMode,
  setPrivacyMode,
  isRememberMe,
  setRememberMe,
  clearSensitiveData,
} from "../lib/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  error: string | null;

  login: (
    credentials: LoginCredentials
  ) => Promise<AuthSession>;

  register: (
    data: RegisterData
  ) => Promise<AuthUser | null>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<AuthUser | null>;

  hasRole: (
    role: string
  ) => boolean;

  hasAnyRole: (
    roles: string[]
  ) => boolean;

  clearError: () => void;

  // Privacy settings
  isPrivacyMode: () => boolean;
  setPrivacyMode: (enabled: boolean) => void;
  isRememberMe: () => boolean;
  setRememberMe: (enabled: boolean) => void;
  clearSensitiveData: () => void;
}

/* =======================================================
   AUTH HOOK
======================================================= */

export function useAuth(): UseAuthReturn {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  // Background revalidation must not blank out a profile already on screen.
  const hasUserRef = useRef(false);

  const applyUser = useCallback((next: AuthUser | null) => {
    hasUserRef.current = Boolean(next);
    setUser(next);
  }, []);

  /* -------------------------------------------------------
     REFRESH USER
  ------------------------------------------------------- */

  const refreshUser =
    useCallback(
      async (): Promise<
        AuthUser | null
      > => {
        if (!hasUserRef.current) setLoading(true);

        try {
          // getCurrentUser() clears the session itself when the server
          // rejects the token, so a dead session is never kept alive here.
          const currentUser = await getCurrentUser();
          applyUser(currentUser);
          return currentUser;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to load user";

          setError(message);
          clearAuthSession();
          applyUser(null);
          return null;
        } finally {
          setLoading(false);
        }
      },
      [applyUser]
    );

  /* -------------------------------------------------------
     INITIAL AUTH CHECK
  ------------------------------------------------------- */

  useEffect(() => {
    setIsMounted(true);

    // Client-only: storage is empty during SSR, which would cause hydration drift.
    if (typeof window === "undefined") return;

    if (!isAuthenticated()) {
      applyUser(null);
      setLoading(false);
      return;
    }

    // Paint immediately from the cached profile, then confirm it server-side.
    applyUser(getStoredUser());
    setLoading(false);
    void refreshUser();
  }, [refreshUser, applyUser]);

  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  const handleLogin =
    useCallback(
      async (
        credentials: LoginCredentials
      ): Promise<AuthSession> => {
        try {
          setLoading(true);
          setError(null);

          const session =
            await login(credentials);

          // An MFA challenge is not a session yet.
          applyUser(session.accessToken ? session.user : null);

          return session;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Login failed";

          setError(message);
          applyUser(null);

          throw new Error(message);
        } finally {
          setLoading(false);
        }
      },
      [applyUser]
    );

  /* -------------------------------------------------------
     REGISTER
  ------------------------------------------------------- */

  const handleRegister =
    useCallback(
      async (
        data: RegisterData
      ): Promise<
        AuthUser | null
      > => {
        try {
          setLoading(true);
          setError(null);

          return await register(data);
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Registration failed";

          setError(message);

          throw new Error(message);
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  const handleLogout =
    useCallback(
      async (): Promise<void> => {
        try {
          setError(null);
          await logout();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Logout failed";

          setError(message);
        } finally {
          applyUser(null);
        }
      },
      [applyUser]
    );

  /* -------------------------------------------------------
     CLEAR ERROR
  ------------------------------------------------------- */

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /* -------------------------------------------------------
     ROLE CHECKS
  ------------------------------------------------------- */

  const checkRole =
    useCallback(
      (role: string): boolean => {
        return hasRole(
          role,
          user
        );
      },
      [user]
    );

  const checkAnyRole =
    useCallback(
      (roles: string[]): boolean => {
        return hasAnyRole(
          roles,
          user
        );
      },
      [user]
    );

  /* -------------------------------------------------------
     RETURN
  ------------------------------------------------------- */

  return {
    user,

    loading: loading || !isMounted,

    isLoggedIn:
      Boolean(user) &&
      isAuthenticated(),

    error,

    login: handleLogin,

    register: handleRegister,

    logout: handleLogout,

    refreshUser,

    hasRole: checkRole,

    hasAnyRole: checkAnyRole,

    clearError,

    // Privacy settings
    isPrivacyMode,
    setPrivacyMode,
    isRememberMe,
    setRememberMe,
    clearSensitiveData,
  };
}

export default useAuth;
