// ============================================================
// MFA VERIFY PAGE — 6-digit TOTP code entry
// ============================================================

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, ArrowLeft, Loader2, Smartphone, AlertCircle } from "lucide-react";
import { authApi } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { AuthUser } from "../types/auth";

export default function MfaVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const state = location.state as {
    mfaToken: string;
    user: { id: string; email: string; fullName: string };
  } | null;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backupMode, setBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!state?.mfaToken) { navigate("/login"); return; }
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (idx: number, val: string) => {
    // Allow paste of full code
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
    if (next.every((d) => d) && next.join("").length === 6) {
      submitCode(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const submitCode = async (code: string) => {
    if (!state?.mfaToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await authApi.verifyMfa(state.mfaToken, code);
      const data = res.data;
      if (data?.accessToken && data?.user) {
        setAuth({
          user: data.user as AuthUser,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          sessionId: data.sessionId,
        });
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Invalid code. Please try again.");
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

  if (!state) return null;

  return (
    <div className="auth-layout">
      <div className="auth-card fade-in">
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => navigate("/login")}
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.12)",
            border: "2px solid rgba(99,102,241,0.30)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }} className="pulse-ring">
            <Smartphone size={28} color="var(--brand-primary)" />
          </div>
          <h1 className="auth-title">Two-Factor Auth</h1>
          <p className="auth-subtitle" style={{ marginBottom: 0 }}>
            Enter the 6-digit code from your authenticator app
            <br />
            <span style={{ fontSize: 12 }}>
              Signing in as <strong style={{ color: "var(--text-primary)" }}>
                {state.user.fullName}
              </strong>
            </span>
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {!backupMode ? (
          <>
            <div className="otp-group">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  placeholder="·"
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                />
              ))}
            </div>

            {loading && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Loader2 size={20} color="var(--brand-primary)" style={{ animation: "spin 0.7s linear infinite" }} />
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setBackupMode(true)}
                style={{ fontSize: 13 }}
              >
                Use a backup code instead
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleBackupSubmit}>
            <div className="form-group">
              <label className="form-label">Backup Code</label>
              <input
                type="text"
                className="form-input no-left-icon mono"
                placeholder="xxxxxxxx"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                autoFocus
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !backupCode.trim()}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: "spin 0.7s linear infinite" }} /> Verifying…</>
              ) : (
                <><Shield size={18} /> Verify Backup Code</>
              )}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setBackupMode(false)} style={{ fontSize: 13 }}>
                Use authenticator code instead
              </button>
            </div>
          </form>
        )}

        <div style={{
          marginTop: 28,
          padding: "14px",
          background: "rgba(6,182,212,0.06)",
          border: "1px solid rgba(6,182,212,0.15)",
          borderRadius: "var(--radius-sm)",
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--info)" }}>🔐 Security note:</strong>{" "}
          Codes expire every 30 seconds. If your clock is off, codes may be rejected.
        </div>
      </div>
    </div>
  );
}
