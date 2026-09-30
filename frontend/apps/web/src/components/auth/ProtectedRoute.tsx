"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isLoggedIn, loading, hasAnyRole } = useAuth();
  const router = useRouter();

  const roleAllowed = !requiredRoles || requiredRoles.length === 0 || hasAnyRole(requiredRoles);

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (!roleAllowed) {
      router.replace("/unauthorized");
    }
  }, [isLoggedIn, loading, roleAllowed, router]);

  // Render nothing while unauthenticated so a protected screen never flashes
  // ahead of the redirect.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-sm text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !roleAllowed) {
    return null;
  }

  return <>{children}</>;
}
