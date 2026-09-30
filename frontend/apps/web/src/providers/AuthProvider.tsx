"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";

interface AuthProviderProps {
  children: ReactNode;
}

// Routes reachable without a completed sign-in.
const PUBLIC_ROUTES = ["/login", "/register", "/unauthorized", "/mfa-setup"];

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    // Only redirect once the initial check has settled.
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isPublicRoute, isLoggedIn, loading, router]);

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
