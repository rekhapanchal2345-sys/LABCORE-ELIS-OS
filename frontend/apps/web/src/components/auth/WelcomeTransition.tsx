"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
export interface WelcomeTransitionProps {
  userName: string;
  role: string;
  lastLoginTime?: string;
  quickStat?: string;
  onComplete: () => void;
  shortMode?: boolean;
}

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function formatLastLogin(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return ""; }
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getRoleColor(role: string): { bg: string; text: string; glow: string; accent: string } {
  const r = role.toLowerCase();
  if (r.includes("admin"))       return { bg: "rgba(239,68,68,0.12)",   text: "#fca5a5", glow: "rgba(239,68,68,0.35)",    accent: "#ef4444" };
  if (r.includes("doctor") || r.includes("physician")) return { bg: "rgba(59,130,246,0.12)", text: "#93c5fd", glow: "rgba(59,130,246,0.35)", accent: "#3b82f6" };
  if (r.includes("technician") || r.includes("tech"))  return { bg: "rgba(16,185,129,0.12)", text: "#6ee7b7", glow: "rgba(16,185,129,0.35)", accent: "#10b981" };
  if (r.includes("manager") || r.includes("supervisor")) return { bg: "rgba(245,158,11,0.12)", text: "#fcd34d", glow: "rgba(245,158,11,0.35)", accent: "#f59e0b" };
  if (r.includes("pathologist")) return { bg: "rgba(56,189,248,0.12)", text: "#7dd3fc",  glow: "rgba(56,189,248,0.35)",  accent: "#0ea5e9" };
  return { bg: "rgba(99,102,241,0.12)", text: "#a5b4fc", glow: "rgba(99,102,241,0.35)", accent: "#6366f1" };
}

/** Build animated DNA helix path for SVG */
function buildDNAPath(w: number, h: number, offset: number, strand: "A" | "B"): string {
  const pts: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = strand === "A"
      ? w / 2 + Math.sin(t * Math.PI * 4 + offset) * (w * 0.36)
      : w / 2 + Math.sin(t * Math.PI * 4 + offset + Math.PI) * (w * 0.36);
    const y = t * h;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* ─────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────── */

function Particle({ delay, duration, x, y, size, color }: {
  delay: number; duration: number; x: number; y: number; size: number; color: string;
}) {
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`, top: `${y}%`,
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      animation: `wt-particle-float ${duration}s ${delay}s ease-in-out infinite alternate`,
      opacity: 0.6,
    }} />
  );
}

function ECGWave({ color, visible }: { color: string; visible: boolean }) {
  return (
    <svg width="280" height="50" viewBox="0 0 280 50" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s" }}>
      <defs>
        <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="25%" stopColor={color} stopOpacity="0.8" />
          <stop offset="75%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="ecg-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path
        d="M0,25 L40,25 L55,25 L60,10 L65,40 L70,8 L78,42 L85,25 L120,25 L160,25 L175,25 L180,12 L185,38 L190,8 L198,42 L205,25 L240,25 L280,25"
        fill="none"
        stroke="url(#ecg-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ecg-glow)"
        strokeDasharray="600"
        strokeDashoffset="600"
        style={{ animation: visible ? "wt-ecg-draw 1.6s ease-in-out both" : "none" }}
      />
    </svg>
  );
}

function BiometricScanner({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{ position: "relative", width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="bio-ring-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx="34" cy="34" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        {active && (
          <circle
            cx="34" cy="34" r="30"
            fill="none"
            stroke="url(#bio-ring-g)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="188"
            strokeDashoffset="188"
            style={{ animation: "wt-bio-ring 1s cubic-bezier(0.4,0,0.2,1) 0.2s both", transformOrigin: "34px 34px", transform: "rotate(-90deg)" }}
          />
        )}
      </svg>
      {/* Fingerprint arc lines */}
      <svg width="34" height="34" viewBox="0 0 36 36" style={{ position: "relative", zIndex: 1 }}>
        <path d="M18 4 C10 4 4 10 4 18" fill="none" stroke={active ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" strokeLinecap="round" style={{ transition: "stroke 0.4s" }} />
        <path d="M18 8 C12 8 8 13 8 18 C8 23 10 27 14 30" fill="none" stroke={active ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" strokeLinecap="round" style={{ transition: "stroke 0.4s 0.08s" }} />
        <path d="M18 12 C14 12 11 15 11 18 C11 22 13 26 16 29" fill="none" stroke={active ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" strokeLinecap="round" style={{ transition: "stroke 0.4s 0.16s" }} />
        <path d="M18 16 C16 16 14 17 14 19 C14 22 16 26 19 29" fill="none" stroke={active ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" strokeLinecap="round" style={{ transition: "stroke 0.4s 0.24s" }} />
        <path d="M22 6 C28 9 32 13 32 18 C32 24 28 30 22 32" fill="none" stroke={active ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" strokeLinecap="round" style={{ transition: "stroke 0.4s 0.12s" }} />
        {active && (
          <circle cx="18" cy="18" r="3" fill={color}
            style={{ animation: "wt-bio-pulse 1.5s ease-in-out 0.8s infinite" }} />
        )}
      </svg>
    </div>
  );
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   MAIN COMPONENT
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
export function WelcomeTransition({
  userName, role, lastLoginTime, quickStat, onComplete, shortMode = false,
}: WelcomeTransitionProps) {
  const firstName    = getFirstName(userName);
  const initials     = getInitials(userName);
  const greeting     = getGreeting();
  const lastLoginFmt = formatLastLogin(lastLoginTime);
  const roleColor    = getRoleColor(role);
  const doneRef      = useRef(false);

  const [phase, setPhase]             = useState(0);
  const [exiting, setExiting]         = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [dnaOffset, setDnaOffset]     = useState(0);
  const [scanY, setScanY]             = useState(0);
  const [typedName, setTypedName]     = useState("");
  const [showCheckmark, setShowCheckmark] = useState(false);

  /* DNA helix continuous tick */
  useEffect(() => {
    const id = setInterval(() => setDnaOffset(p => p + 0.045), 40);
    return () => clearInterval(id);
  }, []);

  /* Biometric scan line sweep */
  useEffect(() => {
    if (phase < 2) return;
    const id = setInterval(() => setScanY(p => (p + 1.8) % 100), 22);
    return () => clearInterval(id);
  }, [phase]);

  /* Typewriter effect for name */
  useEffect(() => {
    if (phase < 4) { setTypedName(""); return; }
    let i = 0;
    const id = setInterval(() => {
      setTypedName(firstName.slice(0, i + 1));
      i++;
      if (i >= firstName.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [phase, firstName]);

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    setTimeout(() => onComplete(), 700);
  }, [onComplete]);

  /* Phase sequencing */
  useEffect(() => {
    if (shortMode) {
      setPhase(7); setProgressPct(100);
      const t = setTimeout(complete, 1000);
      return () => clearTimeout(t);
    }

    const schedule: [number, number][] = [
      [1, 100],   // bg + particles
      [2, 600],   // biometric scanner + DNA
      [3, 1500],  // ring draw
      [4, 2500],  // greeting + typewriter
      [5, 3500],  // role badge + ECG
      [6, 4500],  // last login + progress
      [7, 5500],  // skip hint
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];
    schedule.forEach(([ph, ms]) => timers.push(setTimeout(() => setPhase(ph), ms)));
    timers.push(setTimeout(() => setShowCheckmark(true), 1020));

    let pct = 0;
    const prog = setInterval(() => {
      pct = Math.min(pct + 0.5, 97);
      setProgressPct(pct);
    }, 60);
    timers.push(setTimeout(() => { setProgressPct(100); clearInterval(prog); }, 4800));
    timers.push(setTimeout(complete, 5000));

    return () => { timers.forEach(clearTimeout); clearInterval(prog); };
  }, [complete, shortMode]);

  const skip = () => complete();
  const show = (minPhase: number) => phase >= minPhase;

  /* Static particle positions */
  const particles = [
    { x: 8,  y: 14, size: 4, color: "rgba(99,102,241,0.7)",  delay: 0,    duration: 4   },
    { x: 88, y: 19, size: 3, color: "rgba(124,58,237,0.6)",  delay: 0.5,  duration: 5   },
    { x: 5,  y: 70, size: 5, color: "rgba(56,189,248,0.5)",  delay: 1,    duration: 3.5 },
    { x: 92, y: 75, size: 4, color: "rgba(16,185,129,0.6)",  delay: 0.3,  duration: 4.5 },
    { x: 50, y: 5,  size: 3, color: "rgba(167,139,250,0.5)", delay: 0.8,  duration: 3   },
    { x: 14, y: 90, size: 4, color: "rgba(99,102,241,0.5)",  delay: 1.2,  duration: 5.5 },
    { x: 80, y: 88, size: 3, color: "rgba(56,189,248,0.4)",  delay: 0.6,  duration: 4   },
    { x: 3,  y: 44, size: 2, color: "rgba(245,158,11,0.5)",  delay: 1.5,  duration: 6   },
    { x: 96, y: 50, size: 2, color: "rgba(239,68,68,0.4)",   delay: 0.9,  duration: 3.5 },
    { x: 45, y: 95, size: 3, color: "rgba(124,58,237,0.5)",  delay: 0.2,  duration: 4.5 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes wt-scan {
          0%{ top:-4px;opacity:0 } 5%{ opacity:1 } 95%{ opacity:0.4 } 100%{ top:100%;opacity:0 }
        }
        @keyframes wt-particle-float {
          from{ transform:translateY(0) scale(1);    opacity:0.6 }
          to  { transform:translateY(-20px) scale(1.3); opacity:0.15 }
        }
        @keyframes wt-logo-spring {
          0%  { transform:scale(0.3) rotate(-12deg); opacity:0 }
          55% { transform:scale(1.15) rotate(3deg);  opacity:1 }
          75% { transform:scale(0.93) rotate(-1deg) }
          90% { transform:scale(1.04) rotate(0.4deg) }
          100%{ transform:scale(1) rotate(0deg);     opacity:1 }
        }
        @keyframes wt-logo-glow {
          0%,100%{ box-shadow:0 0 45px rgba(99,102,241,0.55),0 0 90px rgba(99,102,241,0.22),inset 0 1px 0 rgba(255,255,255,0.12) }
          50%    { box-shadow:0 0 80px rgba(99,102,241,0.9), 0 0 160px rgba(99,102,241,0.38),inset 0 1px 0 rgba(255,255,255,0.18) }
        }
        @keyframes wt-ring-draw {
          from{ stroke-dashoffset:390 } to{ stroke-dashoffset:0 }
        }
        @keyframes wt-ring-rotate {
          from{ transform:rotate(0deg) } to{ transform:rotate(360deg) }
        }
        @keyframes wt-check-pop {
          0%  { stroke-dashoffset:60; opacity:0 }
          35% { opacity:1 }
          100%{ stroke-dashoffset:0;  opacity:1 }
        }
        @keyframes wt-avatar-spring {
          0%  { transform:scale(0.4) translateY(14px); opacity:0 }
          55% { transform:scale(1.14) translateY(-5px); opacity:1 }
          80% { transform:scale(0.94) translateY(1px) }
          100%{ transform:scale(1) translateY(0);    opacity:1 }
        }
        @keyframes wt-slide-up {
          from{ opacity:0; transform:translateY(36px) } to{ opacity:1; transform:translateY(0) }
        }
        @keyframes wt-fade-up {
          from{ opacity:0; transform:translateY(16px) } to{ opacity:1; transform:translateY(0) }
        }
        @keyframes wt-badge-pop {
          0%  { transform:scale(0.5) translateY(10px); opacity:0 }
          60% { transform:scale(1.08) translateY(-2px); opacity:1 }
          100%{ transform:scale(1) translateY(0);       opacity:1 }
        }
        @keyframes wt-shimmer {
          0%  { background-position:-300% center } 100%{ background-position:300% center }
        }
        @keyframes wt-bio-ring {
          from{ stroke-dashoffset:188 } to{ stroke-dashoffset:0 }
        }
        @keyframes wt-bio-pulse {
          0%,100%{ opacity:1 } 50%{ opacity:0.35 }
        }
        @keyframes wt-ecg-draw {
          from{ stroke-dashoffset:600; opacity:0 } 10%{ opacity:1 } to{ stroke-dashoffset:0; opacity:1 }
        }
        @keyframes wt-cursor {
          50%{ opacity:0 }
        }
        @keyframes wt-circuit-draw {
          from{ stroke-dashoffset:200 } to{ stroke-dashoffset:0 }
        }
        @keyframes wt-dot-pulse {
          0%,80%,100%{ transform:scale(0.6); opacity:0.3 } 40%{ transform:scale(1); opacity:1 }
        }
        @keyframes wt-status-glow {
          0%,100%{ opacity:0.65 } 50%{ opacity:1 }
        }
        @keyframes wt-exit {
          to{ opacity:0; transform:scale(1.06) }
        }

        .wt-screen-exiting {
          animation: wt-exit 0.65s cubic-bezier(0.4,0,1,1) forwards !important;
          pointer-events: none;
        }
        .wt-neon-text {
          background: linear-gradient(135deg, #c7d2fe 0%, #a78bfa 25%, #818cf8 50%, #67e8f9 75%, #a5b4fc 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: wt-shimmer 4s linear infinite;
        }
        .wt-dot {
          display:inline-block; width:5px; height:5px;
          border-radius:50%; background:rgba(99,102,241,0.7);
        }
        .wt-dot:nth-child(1){ animation:wt-dot-pulse 1.2s 0s ease-in-out infinite }
        .wt-dot:nth-child(2){ animation:wt-dot-pulse 1.2s 0.2s ease-in-out infinite }
        .wt-dot:nth-child(3){ animation:wt-dot-pulse 1.2s 0.4s ease-in-out infinite }
        .wt-status-dot { animation:wt-status-glow 2s ease-in-out infinite }
      `}</style>

      {/* ══════════ ROOT OVERLAY ══════════ */}
      <div
        onClick={skip}
        className={exiting ? "wt-screen-exiting" : ""}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "#040407",
          fontFamily: "'Inter', system-ui, sans-serif",
          cursor: "default", overflow: "hidden", userSelect: "none",
        }}
      >
        {/* ── ANIMATED BACKGROUND ── */}
        {show(1) && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {/* Aurora gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: [
                "radial-gradient(ellipse 75% 60% at 12% 30%, rgba(79,70,229,0.24) 0%, transparent 65%)",
                "radial-gradient(ellipse 60% 75% at 88% 68%, rgba(124,58,237,0.18) 0%, transparent 65%)",
                "radial-gradient(ellipse 45% 55% at 52% 95%, rgba(56,189,248,0.10) 0%, transparent 70%)",
              ].join(", "),
            }} />

            {/* Floating particles */}
            {particles.map((p, i) => <Particle key={i} {...p} />)}

            {/* Hex grid */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03 }}>
              <defs>
                <pattern id="wt-hex2" x="0" y="0" width="56" height="97" patternUnits="userSpaceOnUse">
                  <polygon points="28,2 54,16 54,81 28,95 2,81 2,16" fill="none" stroke="rgba(139,92,246,1)" strokeWidth="0.7" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wt-hex2)" />
            </svg>

            {/* DNA helix – LEFT */}
            <svg style={{ position: "absolute", left: 0, top: 0, width: 110, height: "100%", opacity: 0.18 }} viewBox="0 0 110 800" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dna-l" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                  <stop offset="30%" stopColor="#6366f1" stopOpacity="1" />
                  <stop offset="70%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={buildDNAPath(110, 800, dnaOffset, "A")} fill="none" stroke="url(#dna-l)" strokeWidth="1.5" strokeLinecap="round" />
              <path d={buildDNAPath(110, 800, dnaOffset, "B")} fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 8" />
              {Array.from({ length: 14 }, (_, ri) => {
                const t = (ri + 0.5) / 14;
                const xA = 55 + Math.sin(t * Math.PI * 4 + dnaOffset) * (110 * 0.36);
                const xB = 55 + Math.sin(t * Math.PI * 4 + dnaOffset + Math.PI) * (110 * 0.36);
                const y = t * 800;
                return <line key={ri} x1={xA.toFixed(1)} y1={y.toFixed(1)} x2={xB.toFixed(1)} y2={y.toFixed(1)} stroke="rgba(99,102,241,0.3)" strokeWidth="0.8" />;
              })}
            </svg>

            {/* DNA helix – RIGHT (mirrored) */}
            <svg style={{ position: "absolute", right: 0, top: 0, width: 110, height: "100%", opacity: 0.18, transform: "scaleX(-1)" }} viewBox="0 0 110 800" preserveAspectRatio="none">
              <path d={buildDNAPath(110, 800, dnaOffset + 1.2, "A")} fill="none" stroke="rgba(124,58,237,0.8)" strokeWidth="1.5" strokeLinecap="round" />
              <path d={buildDNAPath(110, 800, dnaOffset + 1.2, "B")} fill="none" stroke="rgba(56,189,248,0.55)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 8" />
              {Array.from({ length: 14 }, (_, ri) => {
                const t = (ri + 0.5) / 14;
                const xA = 55 + Math.sin(t * Math.PI * 4 + dnaOffset + 1.2) * (110 * 0.36);
                const xB = 55 + Math.sin(t * Math.PI * 4 + dnaOffset + 1.2 + Math.PI) * (110 * 0.36);
                const y = t * 800;
                return <line key={ri} x1={xA.toFixed(1)} y1={y.toFixed(1)} x2={xB.toFixed(1)} y2={y.toFixed(1)} stroke="rgba(99,102,241,0.3)" strokeWidth="0.8" />;
              })}
            </svg>

            {/* Scan beam */}
            <div style={{ position: "absolute", left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 25%, rgba(139,92,246,0.9) 50%, rgba(99,102,241,0.6) 75%, transparent 100%)", animation: "wt-scan 8s linear infinite", filter: "blur(2px)" }} />

            {/* Corner circuits */}
            <svg style={{ position: "absolute", top: 0, left: 0, opacity: 0.2 }} width="200" height="200" viewBox="0 0 200 200">
              <path d="M0 80 L40 80 L40 40 L80 40" stroke="#6366f1" strokeWidth="1" fill="none" strokeDasharray="200" strokeDashoffset="200" style={{ animation: "wt-circuit-draw 1s 0.5s ease both" }} />
              <path d="M0 120 L30 120 L30 65 L90 65" stroke="#8b5cf6" strokeWidth="0.7" fill="none" strokeDasharray="200" strokeDashoffset="200" style={{ animation: "wt-circuit-draw 1s 0.7s ease both" }} />
              <circle cx="80" cy="40" r="3.5" fill="#6366f1" style={{ animation: "wt-bio-pulse 2s ease-in-out infinite" }} />
              <circle cx="90" cy="65" r="2.5" fill="#8b5cf6" style={{ animation: "wt-bio-pulse 2.5s 0.3s ease-in-out infinite" }} />
            </svg>
            <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.2 }} width="200" height="200" viewBox="0 0 200 200">
              <path d="M200 120 L160 120 L160 160 L120 160" stroke="#6366f1" strokeWidth="1" fill="none" strokeDasharray="200" strokeDashoffset="200" style={{ animation: "wt-circuit-draw 1s 0.6s ease both" }} />
              <circle cx="120" cy="160" r="3.5" fill="#6366f1" style={{ animation: "wt-bio-pulse 2s 1s ease-in-out infinite" }} />
            </svg>
          </div>
        )}

        {/* ── TOP STATUS BAR ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "13px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(4,4,7,0.75)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", boxShadow: "0 0 14px rgba(99,102,241,0.5)" }}>LC</div>
            <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>LabCore ELIS v4.2</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="wt-status-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 7px #34d399" }} />
              <span style={{ color: "rgba(52,211,153,0.7)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em" }}>SESSION VERIFIED</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.14)", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.12em" }}>ISO 15189 · NABH</span>
          </div>
        </div>

        {/* ── CENTER STAGE ── */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* ── LOGO + RING ── */}
          <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Outer conic rotating ring */}
            {show(2) && (
              <div style={{
                position: "absolute", inset: -10, borderRadius: "50%",
                border: "1.5px solid transparent",
                backgroundImage: `conic-gradient(from 0deg, transparent 0%, ${roleColor.accent}66 30%, ${roleColor.accent}cc 50%, ${roleColor.accent}44 70%, transparent 100%)`,
                animation: "wt-ring-rotate 2.5s linear infinite",
                maskImage: "none",
              }} />
            )}

            {/* SVG ring + checkmark */}
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="wt-ring-g2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="40%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <filter id="wt-ring-gf2">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(99,102,241,0.07)" strokeWidth="2.5" />
              {show(3) && (
                <circle cx="80" cy="80" r="62" fill="none" stroke="url(#wt-ring-g2)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="390" strokeDashoffset="390" filter="url(#wt-ring-gf2)"
                  style={{ animation: "wt-ring-draw 0.9s cubic-bezier(0.4,0,0.2,1) both", transformOrigin: "80px 80px", transform: "rotate(-90deg)" }} />
              )}
              {showCheckmark && (
                <path d="M56 80 L72 96 L104 62" fill="none" stroke="#34d399" strokeWidth="4"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="60" strokeDashoffset="60"
                  style={{ animation: "wt-check-pop 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" }} />
              )}
            </svg>

            {/* LC Logo */}
            {show(1) && (
              <div style={{
                width: 96, height: 96, borderRadius: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #6d28d9 100%)",
                fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em",
                position: "relative", zIndex: 1, overflow: "hidden",
                animation: "wt-logo-spring 0.9s cubic-bezier(0.16,1,0.3,1) both, wt-logo-glow 3s ease-in-out 1s infinite",
              }}>
                LC
                <div style={{ position: "absolute", top: -4, left: -4, width: 14, height: 14, borderTop: "2px solid #a5b4fc", borderLeft: "2px solid #a5b4fc", borderRadius: "4px 0 0 0" }} />
                <div style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderTop: "2px solid #a5b4fc", borderRight: "2px solid #a5b4fc", borderRadius: "0 4px 0 0" }} />
                <div style={{ position: "absolute", bottom: -4, left: -4, width: 14, height: 14, borderBottom: "2px solid #8b5cf6", borderLeft: "2px solid #8b5cf6", borderRadius: "0 0 0 4px" }} />
                <div style={{ position: "absolute", bottom: -4, right: -4, width: 14, height: 14, borderBottom: "2px solid #8b5cf6", borderRight: "2px solid #8b5cf6", borderRadius: "0 0 4px 0" }} />
                {/* Biometric scan line on logo */}
                {show(2) && (
                  <div style={{
                    position: "absolute", left: 0, right: 0, height: 2,
                    top: `${scanY % 100}%`,
                    background: `linear-gradient(90deg, transparent, ${roleColor.accent}cc, transparent)`,
                    boxShadow: `0 0 10px ${roleColor.accent}`,
                    opacity: 0.8,
                    transition: "top 0.022s linear",
                  }} />
                )}
              </div>
            )}
          </div>

          {/* ── BIOMETRIC SCANNERS + AVATAR ROW ── */}
          {show(2) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 22, marginTop: 18,
              animation: "wt-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              <BiometricScanner active={show(3)} color={roleColor.accent} />
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: `linear-gradient(135deg, #4f46e5, ${roleColor.accent})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 21, fontWeight: 800, color: "#fff",
                boxShadow: `0 0 0 3px rgba(99,102,241,0.22), 0 0 44px ${roleColor.glow}`,
                animation: "wt-avatar-spring 0.8s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                {initials}
              </div>
              <BiometricScanner active={show(3)} color={roleColor.accent} />
            </div>
          )}

          {/* ── GREETING + TYPEWRITER NAME ── */}
          {show(4) && (
            <div style={{
              marginTop: 22, textAlign: "center",
              animation: "wt-slide-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                {greeting},
              </p>
              <h1 style={{ margin: 0, lineHeight: 1.05, minHeight: 58 }}>
                <span className="wt-neon-text" style={{ fontSize: 50, fontWeight: 900, letterSpacing: "-0.04em" }}>
                  {typedName}
                </span>
                <span style={{
                  display: "inline-block", width: 3, height: 48, background: roleColor.accent,
                  verticalAlign: "middle", marginLeft: 3, borderRadius: 2,
                  animation: "wt-cursor 1s step-end infinite",
                  opacity: typedName.length >= firstName.length ? 0 : 1,
                  transition: "opacity 0.3s",
                }} />
              </h1>
            </div>
          )}

          {/* ── ROLE BADGE ── */}
          {show(5) && (
            <div style={{ marginTop: 14, animation: "wt-badge-pop 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "9px 20px", borderRadius: 999,
                background: roleColor.bg,
                border: `1px solid ${roleColor.glow}`,
                boxShadow: `0 0 28px ${roleColor.glow}, 0 0 64px ${roleColor.glow}55`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: roleColor.text, boxShadow: `0 0 10px ${roleColor.text}`, animation: "wt-status-glow 2s ease-in-out infinite" }} />
                <span style={{ color: roleColor.text, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Signed in as {role}
                </span>
              </div>
            </div>
          )}

          {/* ── ECG HEARTBEAT WAVE ── */}
          {show(5) && (
            <div style={{ marginTop: 16, animation: "wt-fade-up 0.5s ease both" }}>
              <ECGWave color={roleColor.accent} visible={show(5)} />
            </div>
          )}

          {/* ── LAST LOGIN + QUICK STAT ── */}
          {show(6) && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "wt-fade-up 0.5s ease both" }}>
              {lastLoginFmt && (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span style={{ color: "rgba(255,255,255,0.24)", fontSize: 11.5, letterSpacing: "0.01em", fontFamily: "monospace" }}>
                    Last session: {lastLoginFmt}
                  </span>
                </div>
              )}
              {quickStat && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 15px", borderRadius: 10,
                  background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.18)",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  <span style={{ color: "rgba(56,189,248,0.85)", fontSize: 12, fontWeight: 500 }}>{quickStat}</span>
                </div>
              )}
            </div>
          )}

          {/* ── PROGRESS BAR ── */}
          {show(6) && (
            <div style={{ marginTop: 30, width: 260, animation: "wt-fade-up 0.5s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <span className="wt-dot" />
                  <span className="wt-dot" />
                  <span className="wt-dot" />
                </div>
                <span style={{ color: "rgba(99,102,241,0.55)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  Initializing workspace… {Math.round(progressPct)}%
                </span>
              </div>
              <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${progressPct}%`,
                  background: `linear-gradient(90deg, #4f46e5, ${roleColor.accent}, #38bdf8)`,
                  borderRadius: 999,
                  boxShadow: `0 0 14px ${roleColor.accent}cc`,
                  transition: "width 0.22s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 12 }}>
                {["AUTH", "DB", "FHIR", "NABH"].map((chip, i) => (
                  <div key={chip} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontFamily: "monospace", color: progressPct >= 25 * (i + 1) ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.12)", transition: "color 0.4s" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: progressPct >= 25 * (i + 1) ? "#34d399" : "rgba(255,255,255,0.08)", boxShadow: progressPct >= 25 * (i + 1) ? "0 0 6px #34d399" : "none", transition: "all 0.4s" }} />
                    {chip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SKIP HINT ── */}
        {show(7) && (
          <div style={{
            position: "absolute", bottom: 28,
            color: "rgba(255,255,255,0.12)", fontSize: 11,
            letterSpacing: "0.07em", fontFamily: "monospace",
            animation: "wt-fade-up 0.6s ease both",
          }}>
            tap anywhere to skip →
          </div>
        )}
      </div>
    </>
  );
}
