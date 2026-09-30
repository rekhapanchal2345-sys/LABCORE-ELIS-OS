"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
          🔒
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Access Denied
        </h1>

        <p className="mt-4 text-gray-600">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
