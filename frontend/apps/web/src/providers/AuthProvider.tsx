"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";

interface AuthProviderProps {
  children: ReactNode;
}

// Routes reachable without a completed sign-in.
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/register",
  "/unauthorized",
  "/mfa-setup",
];

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (loading) return;

    // Unauthenticated user attempting to access protected route -> redirect to login
    if (!isLoggedIn && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    // Already logged in user attempting to access login/forgot-password -> redirect to dashboard
    if (isLoggedIn && (pathname === "/login" || pathname === "/forgot-password")) {
      router.replace("/dashboard");
    }
  }, [isPublicRoute, isLoggedIn, loading, pathname, router]);

  // Show loading state during auth check
  if (loading && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
