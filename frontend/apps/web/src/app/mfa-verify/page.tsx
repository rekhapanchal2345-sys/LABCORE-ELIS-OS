"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import type { KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowLeft, Loader2, Smartphone, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { setAuthSession, type AuthUser, type AuthSession } from "@/lib/auth";
import LabCoreLogo from "@/components/common/LabCoreLogo";

function MfaVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mfaToken, setMfaToken] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [backupMode, setBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const tokenFromStorage = sessionStorage.getItem("mfaVerifyToken") || sessionStorage.getItem("mfaChallengeToken");
    const emailFromStorage = sessionStorage.getItem("mfaUserEmail") || "";
    const tokenFromUrl = searchParams.get("token");

    const token = tokenFromUrl || tokenFromStorage;
    if (!token) {
      router.replace("/login");
      return;
    }
    setMfaToken(token);
    setUserEmail(emailFromStorage);
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
  }, [router, searchParams]);

  const handleDigitChange = (idx: number, val: string) => {
    // Allow paste of full 6-digit code
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      const newDigits = val.split("");
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      submitCode(val);
      return;
    }
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      submitCode(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const submitCode = async (code: string) => {
    if (!mfaToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await authApi.verifyMfa(mfaToken, code.trim());
      const data = res.data || res;
      if (data?.accessToken && data?.user) {
        setSuccess(true);
        const session: AuthSession = {
          user: data.user as AuthUser,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          sessionId: data.sessionId,
        };
        setAuthSession(session);
        sessionStorage.removeItem("mfaVerifyToken");
        sessionStorage.removeItem("mfaChallengeToken");
        setTimeout(() => {
          router.replace("/dashboard");
        }, 600);
      } else {
        throw new Error("Invalid response from auth server");
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Invalid authentication code. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      setBackupCode("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) return;
    await submitCode(backupCode.trim().toLowerCase());
  };

  return (
    <div className="login-root min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden px-4 py-10">
      {/* Glow aura */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(99,102,241,0.2), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <LabCoreLogo size="md" theme="dark" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0a0a12]/90 backdrop-blur-2xl p-8 shadow-2xl relative">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to login</span>
          </button>

          <div className="text-center mb-7">
            <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
              {success ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              ) : (
                <Smartphone className="h-8 w-8 text-indigo-400" />
              )}
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {success ? "Identity Verified" : "Two-Factor Authentication"}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {userEmail ? (
                <span>Operator: <strong className="text-indigo-300 font-mono">{userEmail}</strong></span>
              ) : (
                "Enter the 6-digit rolling code from your authenticator app"
              )}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-xs bg-rose-500/10 border border-rose-500/25 text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <p className="text-emerald-400 font-semibold text-sm">Security clearance approved</p>
              <div className="flex items-center justify-center gap-2 text-xs text-white/40 mt-2 font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span>Launching ELIS workspace…</span>
              </div>
            </div>
          ) : !backupMode ? (
            <>
              {/* 6 Digit OTP input boxes */}
              <div className="flex justify-center gap-2.5 sm:gap-3 my-6">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={d}
                    disabled={loading}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black font-mono text-white bg-white/[0.04] border border-white/15 rounded-xl focus:border-indigo-400 focus:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                    placeholder="·"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                  />
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying TOTP token…</span>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setBackupMode(true)}
                  className="text-xs text-indigo-400/80 hover:text-indigo-300 transition-colors font-mono cursor-pointer"
                >
                  Use a one-time backup code instead
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleBackupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/50 mb-2">
                  Emergency 8-Character Backup Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="xxxxxxxx"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-center tracking-widest text-base focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !backupCode.trim()}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-700 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Backup Code…</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Verify & Grant Access</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setBackupMode(false)}
                  className="text-xs text-indigo-400/80 hover:text-indigo-300 transition-colors font-mono cursor-pointer"
                >
                  Return to 6-digit authenticator code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-[11px] text-white/30 font-mono">
              🛡️ TOTP tokens refresh every 30 seconds (RFC-6238 Standard)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MfaVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    }>
      <MfaVerifyContent />
    </Suspense>
  );
}
