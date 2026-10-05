import { Suspense } from "react";
import PixelPerfectPatientsPage from "@/components/patients/PixelPerfectPatientsPage";

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading Clinical Dossier Directory...</p>
          </div>
        </div>
      }
    >
      <PixelPerfectPatientsPage />
    </Suspense>
  );
}

