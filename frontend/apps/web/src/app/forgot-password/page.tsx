"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import LabCoreLogo from "@/components/common/LabCoreLogo";

type Step = "email" | "code" | "done";

/**
 * Gmail password recovery.
 *
 * Three steps: address, the emailed code, then the new password. The backend
 * answers the same way whether or not the address has an account, so the copy
 * here does the same and never claims that an account was found.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const neutralMessage =
    "If an account exists for that address, a 6-digit code has been sent to it.";

  const FIELD =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition";
  const ICON_FIELD =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition";
  const PRIMARY =
    "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-900/40 transition disabled:opacity-60";
  const ERROR_BOX =
    "flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-300";

  const ErrorBox = () =>
    error ? (
      <div className={ERROR_BOX}>
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    ) : null;

  const StepDots = () => (
    <div className="flex items-center gap-2 mb-6">
      {(["email", "code"] as const).map((s, index) => {
        const active = step === s;
        const reached = step === "code" || index === 0;
        return (
          <div
            key={s}
            className="flex items-center gap-2 flex-1 last:flex-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                active
                  ? "bg-indigo-500 text-white"
                  : reached
                    ? "bg-indigo-500/25 text-indigo-300"
                    : "bg-white/5 text-white/30"
              }`}
            >
              {index + 1}
            </div>
            {index === 0 && <div className="flex-1 h-px bg-white/10" />}
          </div>
        );
      })}
    </div>
  );

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your Gmail address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(trimmed);
      setEmail(trimmed);
      setNotice(neutralMessage);
      setStep("code");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We could not reach the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The two passwords do not match.");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        code: code.trim(),
        newPassword: password,
      });
      // The code and the new password are not kept anywhere after this.
      setCode("");
      setPassword("");
      setConfirmPassword("");
      setStep("done");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "That code could not be verified. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setNotice(neutralMessage);
    } catch {
      setError(
        "We could not send another code. Please wait a moment and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root min-h-screen flex bg-[#050508] items-center justify-center relative overflow-hidden px-4 py-10">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18), transparent 70%)",
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <LabCoreLogo />
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#0a0a12]/90 backdrop-blur-xl p-7 shadow-2xl">
          {step !== "done" && <StepDots />}

          {step === "email" && (
            <>
              <div className="flex items-center gap-2.5 mb-1.5">
                <KeyRound className="h-5 w-5 text-indigo-400" />
                <h1 className="text-lg font-bold text-white">
                  Reset your password
                </h1>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Enter the Gmail address you sign in with. We will send a 6-digit
                code to that inbox.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/80" />
                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@gmail.com"
                    className={ICON_FIELD}
                  />
                </div>

                <ErrorBox />

                <button type="submit" disabled={loading} className={PRIMARY}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending code...</span>
                    </>
                  ) : (
                    <span>Send verification code</span>
                  )}
                </button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="flex items-center gap-2.5 mb-1.5">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h1 className="text-lg font-bold text-white">
                  Enter your code
                </h1>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {notice}
              </p>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  autoFocus
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="000000"
                  className={`${FIELD} text-center text-2xl tracking-[0.5em] font-mono placeholder:text-white/15`}
                />

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/80" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="New password (12+ characters)"
                    className={`${ICON_FIELD} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  className={FIELD}
                />

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Use 12 or more characters with an uppercase letter, a lowercase
                  letter, a number and a symbol.
                </p>

                <ErrorBox />

                <button type="submit" disabled={loading} className={PRIMARY}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Changing password...</span>
                    </>
                  ) : (
                    <span>Set new password</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-indigo-300 transition disabled:opacity-50"
                >
                  Did not receive the code? Send another
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h1 className="text-lg font-bold text-white mb-2">
                Password changed
              </h1>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Your password has been updated and every other signed-in device
                has been signed out for your safety.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className={PRIMARY}
              >
                Go to sign in
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}