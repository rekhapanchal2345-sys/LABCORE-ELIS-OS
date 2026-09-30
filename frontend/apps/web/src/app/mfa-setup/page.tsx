"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { verifyMfaLogin, clearAuthSession } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const MFA_KEYS = ["mfaSetupToken", "mfaOtpauthUrl", "mfaUserEmail"];

function clearMfaDraft() {
  if (typeof window === "undefined") return;
  MFA_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
}

export default function MfaSetupPage() {
  const router = useRouter();
  const [mfaToken, setMfaToken] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  useEffect(() => {
    // Check if we have the MFA setup data in sessionStorage
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('mfaSetupToken');
      const url = sessionStorage.getItem('mfaOtpauthUrl');
      const email = sessionStorage.getItem('mfaUserEmail');

      if (!token || !url || !email) {
        // If no MFA setup data, redirect to login
        router.replace('/login');
        return;
      }

      setMfaToken(token);
      setOtpauthUrl(url);
      setUserEmail(email);

      // Generate QR code data URL
      QRCode.toDataURL(url, { 
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error: Error | null | undefined, dataUrl: string) => {
        if (error) {
          console.error('QR Code generation error:', error);
        } else {
          setQrCodeDataUrl(dataUrl);
        }
      });
    }
  }, [router]);

  const handleCompleteSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // The backend only enables MFA once this code checks out, and answers
      // with the real session plus one-time backup codes.
      const session = await verifyMfaLogin(mfaToken, code.trim());
      clearMfaDraft();
      setBackupCodes(session.backupCodes ?? []);
      setSetupComplete(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete MFA setup";
      setError(message);

      if (err instanceof ApiError && err.code === "MFA_CHALLENGE_EXPIRED") {
        clearMfaDraft();
        clearAuthSession();
        router.replace('/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    clearMfaDraft();
    clearAuthSession();
    router.push('/login');
  };

  if (!mfaToken || !otpauthUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-white/40">Loading MFA setup...</p>
        </div>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="text-center w-full max-w-sm">
          <div className="h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">MFA Setup Complete</h2>
          <p className="text-white/40 mb-6">You are signed in. Two-factor authentication is now required.</p>

          {backupCodes.length > 0 && (
            <div className="text-left bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <p className="text-white/60 text-xs mb-3">
                Save these one-time backup codes. They are shown only now, and each works once if you
                lose your authenticator.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((backup) => (
                  <code key={backup} className="text-[11px] text-emerald-300 mono bg-black/30 rounded px-2 py-1">
                    {backup}
                  </code>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.replace('/dashboard')}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)" }}
          >
            Continue to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to login</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Set Up Two-Factor Authentication</h1>
              <p className="text-white/40 text-sm">Secure your account with MFA</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl mb-4">
              {qrCodeDataUrl && (
                <img 
                  src={qrCodeDataUrl} 
                  alt="MFA QR Code" 
                  className="w-[200px] h-[200px]"
                />
              )}
            </div>
            <p className="text-white/60 text-sm text-center mb-2">
              Scan this QR code with your authenticator app
            </p>
            <p className="text-white/30 text-xs text-center">
              We recommend Google Authenticator, Authy, or Microsoft Authenticator
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-indigo-400 text-xs font-bold">1</span>
            </div>
            <p className="text-white/60 text-sm">Open your authenticator app on your phone</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-indigo-400 text-xs font-bold">2</span>
            </div>
            <p className="text-white/60 text-sm">Scan the QR code above to add your account</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-indigo-400 text-xs font-bold">3</span>
            </div>
            <p className="text-white/60 text-sm">Enter the 6-digit code it shows to finish signing in</p>
          </div>
        </div>

        {/* Action buttons */}
        <form onSubmit={handleCompleteSetup} className="space-y-3">
          <div>
            <label htmlFor="mfa-setup-code" className="block text-white/40 text-xs mb-2">
              Authenticator code
            </label>
            <input
              id="mfa-setup-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="123456"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-center tracking-[0.4em] mono focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
              border: "1px solid rgba(139,92,246,0.4)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify And Finish"
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3.5 rounded-xl text-sm font-medium text-white/60 hover:text-white/80 transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Cancel and sign in again
          </button>
        </form>

        {/* User info */}
        <div className="mt-6 text-center">
          <p className="text-white/20 text-xs">
            Setting up MFA for <span className="text-white/40">{userEmail}</span>
          </p>
        </div>
      </div>
    </div>
  );
}