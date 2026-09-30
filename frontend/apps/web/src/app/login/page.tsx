"use client";
// ──────────────────────────────────────────────────────────────────────────
// Premium rewrite: mouse parallax, 3D card tilt, floating labels, holo text
// cursor glow trail, operator log, ripple button, animated counters
// ──────────────────────────────────────────────────────────────────────────

import { FormEvent, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeTransition } from "@/components/auth/WelcomeTransition";
import {
  isPrivacyMode,
  setPrivacyMode,
  isRememberMe,
  setRememberMe,
  getRoleLabel,
  verifyMfaLogin,
  type AuthSession,
  type AuthUser,
} from "@/lib/auth";
import { ApiError } from "@/lib/api";

import {
  checkBiometricSupport,
  startBiometricAuthentication,
} from "@/lib/webauthn";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  ShieldCheck,
  FlaskConical,
  Activity,
  BarChart3,
  ChevronRight,
  AlertCircle,
  Cpu,
  Zap,
  Wifi,
  Terminal,
  CheckCircle2,
  Shield,
  Sparkles,
  Heart,
  GitBranch,
  Scan,
  KeyRound,
  ArrowRight,
  Binary,
  Layers,
} from "lucide-react";
import LabCoreLogo from "@/components/common/LabCoreLogo";
import MasterRegistrationModal from "@/components/auth/MasterRegistrationModal";

/* ────────────────────────────────────────────────────────────────
   BOOT SPLASH — sci-fi system initialization sequence
───────────────────────────────────────────────────────────────── */
const BOOT_LINES = [
  { ms: 0,    text: "LabCore ELIS v4.2.1 — Secure Boot Initiated",       ok: false },
  { ms: 220,  text: "Loading kernel modules…",                           ok: false },
  { ms: 480,  text: "[  OK  ] AES-256 encryption module loaded",           ok: true  },
  { ms: 680,  text: "[  OK  ] Database connection pool established",        ok: true  },
  { ms: 880,  text: "[  OK  ] NABH compliance layer initialized",           ok: true  },
  { ms: 1080, text: "[  OK  ] HL7 FHIR gateway ready on port 7432",         ok: true  },
  { ms: 1300, text: "Verifying system integrity…",                         ok: false },
  { ms: 1560, text: "[  OK  ] Checksum verified — 0xF4A7B9C2D1E6",         ok: true  },
  { ms: 1780, text: "[  OK  ] Role-based access control enabled",            ok: true  },
  { ms: 1980, text: "[  OK  ] Audit trail activated",                       ok: true  },
  { ms: 2180, text: "Mounting laboratory data stores…",                    ok: false },
  { ms: 2400, text: "[  OK  ] Sample tracking daemon running",              ok: true  },
  { ms: 2600, text: "[  OK  ] Report generation engine ready",              ok: true  },
  { ms: 2780, text: "\u2588 All systems nominal — launching auth portal",      ok: false },
];

function BootSplash({ onDone }: { onDone: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, i]);
          setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        }, line.ms)
      );
    });

    timers.push(setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 120); }, 2700));
    timers.push(setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 80);  }, 2820));

    timers.push(
      setTimeout(() => {
        if (!doneRef.current) {
          setExiting(true);
          setTimeout(() => { doneRef.current = true; onDone(); }, 600);
        }
      }, 3200)
    );

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "#020205",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.015)" : "scale(1)",
        pointerEvents: exiting ? "none" : "all",
        filter: glitch ? "hue-rotate(30deg) brightness(1.3)" : "none",
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
        <defs>
          <pattern id="bh" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
            <polygon points="28,2 54,16 54,44 28,58 2,44 2,16" fill="none" stroke="#6366f1" strokeWidth="0.8"/>
            <polygon points="28,52 54,66 54,94 28,108 2,94 2,66" fill="none" stroke="#6366f1" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bh)" />
      </svg>

      <div style={{
        position: "absolute", left: 0, width: "100%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)",
        animation: "scanBeam 2.5s linear infinite",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.3s",
      }} />

      <div className="relative z-10 w-full max-w-xl px-8">
        <div className="flex flex-col items-center mb-10"
          style={{ animation: "bootLogo 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
          <LabCoreLogo size="xl" variant="full" theme="dark" />
        </div>

        <div
          className="rounded-xl overflow-hidden mb-6"
          style={{
            background: "rgba(8,8,14,0.95)",
            border: "1px solid rgba(99,102,241,0.2)",
            boxShadow: "0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
            <Terminal className="h-3.5 w-3.5 text-indigo-400/70" />
            <span className="text-[11px] text-white/30 font-mono">labcore-boot — /dev/tty0</span>
            <div className="ml-auto flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            </div>
          </div>

          <div className="px-4 py-3 space-y-1 min-h-[220px] max-h-[240px] overflow-hidden">
            {BOOT_LINES.map((line, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[11.5px]"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: visibleLines.includes(i) ? 1 : 0,
                  transform: visibleLines.includes(i) ? "translateX(0)" : "translateX(-8px)",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  color: line.ok
                    ? "rgba(52,211,153,0.85)"
                    : line.text.startsWith("█")
                    ? "rgba(167,139,250,0.9)"
                    : "rgba(255,255,255,0.4)",
                }}
              >
                {line.ok && <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-emerald-400" />}
                {!line.ok && <span className="h-3 w-3 mt-0.5 shrink-0" />}
                <span>{line.text}</span>
              </div>
            ))}

            {!exiting && (
              <div className="flex items-center gap-2 text-[11.5px]"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(99,102,241,0.8)" }}>
                <span className="h-3 w-3 mt-0.5 shrink-0" />
                <span>$ <span style={{ animation: "blink 1s step-end infinite" }}>_</span></span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">System Boot Progress</span>
            <span className="text-[10px] text-indigo-400/60 font-mono">{progress}%</span>
          </div>
          <div className="h-[3px] w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #4f46e5, #7c3aed, #8b5cf6)",
                boxShadow: "0 0 12px rgba(99,102,241,0.6)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-5">
          {["AUTH MODULE", "DB CLUSTER", "FHIR GATEWAY", "NABH LAYER"].map((chip, i) => (
            <div
              key={chip}
              className="flex items-center gap-1.5 text-[10px] font-mono"
              style={{
                color: progress >= 25 * (i + 1) ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.15)",
                transition: "color 0.4s ease",
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: progress >= 25 * (i + 1) ? "#34d399" : "rgba(255,255,255,0.1)",
                  boxShadow: progress >= 25 * (i + 1) ? "0 0 6px rgba(52,211,153,0.6)" : "none",
                  transition: "all 0.4s ease",
                }}
              />
              {chip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   PARTICLE CANVAS — floating particles with connections
────────────────────────────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    interface Particle { x: number; y: number; vx: number; vy: number; r: number; o: number; }
    const particles: Particle[] = [];
    const COUNT = 60;
    const MAX_DIST = 140;

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 0.5,
          o: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(139,92,246,${p.o})`;
        ctx!.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / MAX_DIST)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

/* ────────────────────────────────────────────────────────────────
   DNA HELIX — animated laboratory-themed decoration
────────────────────────────────────────────────────────────────── */
function DnaHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 80;
    canvas.height = 600;
    let t = 0;
    let animId: number;

    function draw() {
      ctx!.clearRect(0, 0, 80, 600);
      const cx = 40;

      for (let i = 0; i < 30; i++) {
        const y = i * 20;
        const phase = t * 0.02 + i * 0.3;
        const x1 = cx + Math.sin(phase) * 18;
        const x2 = cx + Math.sin(phase + Math.PI) * 18;
        const opacity = 0.15 + Math.abs(Math.sin(phase)) * 0.25;

        // backbone dots
        ctx!.beginPath();
        ctx!.arc(x1, y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(99,102,241,${opacity})`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(x2, y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(139,92,246,${opacity})`;
        ctx!.fill();

        // connecting rung
        if (i % 2 === 0) {
          ctx!.beginPath();
          ctx!.moveTo(x1, y);
          ctx!.lineTo(x2, y);
          ctx!.strokeStyle = `rgba(99,102,241,${opacity * 0.5})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }

      t++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none opacity-40"
      style={{ left: "6%", top: "15%", width: 80, height: 600 }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────
   ANIMATED BACKGROUND — hex grid + particles + glowing orbs
────────────────────────────────────────────────────────────────── */
function SciFiBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep base gradient */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(79,70,229,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(124,58,237,0.08) 0%, transparent 60%), #050508"
      }} />

      {/* Hex grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
            <polygon points="28,2 54,16 54,44 28,58 2,44 2,16" fill="none" stroke="rgba(139,92,246,1)" strokeWidth="0.8"/>
            <polygon points="28,52 54,66 54,94 28,108 2,94 2,66" fill="none" stroke="rgba(139,92,246,1)" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      {/* Particle field */}
      <ParticleField />

      {/* DNA Helix */}
      <DnaHelix />

      {/* Main glow orb — left */}
      <div className="absolute" style={{
        top: "-10%", left: "-5%",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)",
        animation: "orbFloat1 12s ease-in-out infinite",
      }} />

      {/* Secondary orb — right bottom */}
      <div className="absolute" style={{
        bottom: "-15%", right: "-5%",
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)",
        animation: "orbFloat2 16s ease-in-out infinite",
      }} />

      {/* Accent orb — center right */}
      <div className="absolute" style={{
        top: "40%", right: "20%",
        width: 250, height: 250,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)",
        animation: "orbFloat3 10s ease-in-out infinite",
      }} />

      {/* Horizontal scan beam */}
      <div style={{
        position: "absolute", left: 0, width: "100%", height: 2,
        background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 30%, rgba(139,92,246,0.8) 50%, rgba(99,102,241,0.6) 70%, transparent 100%)",
        animation: "scanBeam 6s linear infinite",
        filter: "blur(2px)",
      }} />

      {/* Corner circuit lines — top left */}
      <svg className="absolute top-0 left-0 opacity-20" width="200" height="200" viewBox="0 0 200 200">
        <path d="M0 80 L40 80 L40 40 L80 40" stroke="#6366f1" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
        <path d="M0 120 L30 120 L30 60 L100 60" stroke="#8b5cf6" strokeWidth="0.7" fill="none" strokeDasharray="3 6"/>
        <circle cx="80" cy="40" r="3" fill="#6366f1" style={{animation: "pulse 2s ease infinite"}}/>
        <circle cx="100" cy="60" r="2" fill="#8b5cf6" style={{animation: "pulse 2.5s ease infinite"}}/>
      </svg>

      {/* Corner circuit lines — bottom right */}
      <svg className="absolute bottom-0 right-0 opacity-20" width="200" height="200" viewBox="0 0 200 200">
        <path d="M200 120 L160 120 L160 160 L120 160" stroke="#6366f1" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
        <path d="M200 80 L170 80 L170 140 L100 140" stroke="#8b5cf6" strokeWidth="0.7" fill="none" strokeDasharray="3 6"/>
        <circle cx="120" cy="160" r="3" fill="#6366f1" style={{animation: "pulse 2s 1s ease infinite"}}/>
      </svg>

      {/* Floating layers icon (decorative) */}
      <div className="absolute" style={{
        top: "12%", right: "8%",
        animation: "floatMolecule 8s ease-in-out infinite",
        opacity: 0.07,
      }}>
        <Binary size={100} className="text-violet-400" />
      </div>

      {/* Floating search icon */}
      <div className="absolute" style={{
        bottom: "20%", left: "8%",
        animation: "floatMolecule 10s ease-in-out infinite reverse",
        opacity: 0.05,
      }}>
        <Layers size={80} className="text-indigo-400" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   LIVE SYSTEM STATUS BAR
────────────────────────────────────────────────────────────────── */
function SystemStatusBar() {
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const cpu = Math.floor(18 + Math.sin(tick * 0.3) * 8);
  const latency = Math.floor(12 + Math.cos(tick * 0.5) * 5);
  const uptime = `${Math.floor(tick / 3600)}h ${Math.floor((tick % 3600) / 60)}m`;

  return (
    <div className="flex items-center gap-5 text-[10px] font-mono">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400/80">SYS ONLINE</span>
      </div>
      <div className="flex items-center gap-1 text-indigo-400/60">
        <Cpu className="h-2.5 w-2.5" />
        <span>CPU {cpu}%</span>
      </div>
      <div className="flex items-center gap-1 text-violet-400/60">
        <Wifi className="h-2.5 w-2.5" />
        <span>{latency}ms</span>
      </div>
      <div className="text-white/20">{time}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   INTERACTIVE FEATURE METRIC CARD
────────────────────────────────────────────────────────────────── */
function MetricCard({ icon: Icon, label, value, subtext, color, gradient, delay }: {
  icon: any; label: string; value: string; subtext: string; color: string; gradient: string; delay: string;
}) {
  const [hovered, setHovered] = useState(false);
  const numValue = parseInt(value);

  return (
    <div
      className="group relative rounded-xl p-3.5 cursor-default transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
        border: `1px solid ${hovered ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)"}`,
        transform: hovered ? "translateY(-2px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1)" : "none",
        animation: `slideRight 0.6s cubic-bezier(0.16,1,0.3,1) both ${delay}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${color}`}
          style={{
            boxShadow: hovered ? `0 0 20px ${gradient}33` : "none",
          }}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/45 text-[11px] font-medium">{label}</span>
            <span className="text-white/90 text-sm font-bold font-mono">{value}</span>
          </div>
          {/* Animated progress bar */}
          <div className="h-[3px] w-full rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${numValue}%`,
                background: `linear-gradient(90deg, ${gradient}, transparent)`,
                boxShadow: hovered ? `0 0 8px ${gradient}66` : "none",
              }}
            />
          </div>
          <span className="text-[9px] text-white/20 mt-1 block font-mono">{subtext}</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   PASSWORD STRENGTH METER
────────────────────────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    if (s <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
    if (s <= 2) return { score: 2, label: "Fair", color: "#f59e0b" };
    if (s <= 3) return { score: 3, label: "Good", color: "#3b82f6" };
    if (s <= 4) return { score: 4, label: "Strong", color: "#10b981" };
    return { score: 5, label: "Excellent", color: "#8b5cf6" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="flex items-center gap-2 mt-1.5 px-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className="h-[2px] flex-1 rounded-full transition-all duration-300"
            style={{
              background: level <= strength.score ? strength.color : "rgba(255,255,255,0.06)",
              boxShadow: level <= strength.score ? `0 0 4px ${strength.color}44` : "none",
            }}
          />
        ))}
      </div>
      <span className="text-[9px] font-mono transition-colors duration-300"
        style={{ color: strength.color }}>{strength.label}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   ANIMATED TYPING TEXT
────────────────────────────────────────────────────────────────── */
function TypingText({ texts, className }: { texts: string[]; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[currentIndex];

    if (!isDeleting && displayed === current) {
      const timeout = setTimeout(() => setIsDeleting(true), 2500);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayed === "") {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const speed = isDeleting ? 30 : 60;
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayed(current.slice(0, displayed.length - 1));
      } else {
        setDisplayed(current.slice(0, displayed.length + 1));
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentIndex, texts]);

  return (
    <span className={className}>
      {displayed}
      <span className="inline-block w-[2px] h-[1em] bg-indigo-400/60 ml-0.5 align-middle" 
        style={{ animation: "blink 1s step-end infinite" }} />
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
   FLOATING BADGE
────────────────────────────────────────────────────────────────── */
function FloatingBadge({ icon: Icon, text, position, delay }: {
  icon: any; text: string; position: string; delay: string;
}) {
  return (
    <div
      className={`absolute ${position} z-10 hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full`}
      style={{
        background: "rgba(10,10,18,0.7)",
        border: "1px solid rgba(99,102,241,0.15)",
        backdropFilter: "blur(12px)",
        animation: `floatBadge 6s ease-in-out infinite ${delay}`,
      }}
    >
      <Icon className="h-3 w-3 text-indigo-400/60" />
      <span className="text-[10px] text-white/40 font-mono">{text}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mfaChallenge, setMfaChallenge] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [returnUrl, setReturnUrl] = useState("/dashboard");
  const [privacyMode, setPrivacyModeState] = useState(false);
  const [rememberMe, setRememberMeState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<{ name: string; role: string; lastLogin?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute("data-theme", "login");
    setPrivacyModeState(isPrivacyMode());
    setRememberMeState(isRememberMe());
    checkBiometricSupport().then(setBiometricAvailable);
    const p = new URLSearchParams(window.location.search).get("returnUrl");
    if (p) {
      const decoded = decodeURIComponent(p);
      if (decoded && !decoded.startsWith("/login") && decoded !== "/") {
        setReturnUrl(decoded);
      } else {
        setReturnUrl("/dashboard");
      }
    }
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) return setError("Biometric not available.");
    setBiometricLoading(true);
    setError("");
    try {
      await startBiometricAuthentication(btoa(Math.random().toString()));
      setError("Biometric requires backend integration. Use password login.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Biometric failed.");
    } finally {
      setBiometricLoading(false);
    }
  };

  const revealWelcome = (sessionUser?: AuthUser) => {
    const TODAY_KEY = "lc_last_welcome_date";
    const todayStr = new Date().toDateString();
    const isRepeat = sessionStorage.getItem(TODAY_KEY) === todayStr;
    sessionStorage.setItem(TODAY_KEY, todayStr);
    if (isRepeat) sessionStorage.setItem("lc_welcome_short", "1");
    else sessionStorage.removeItem("lc_welcome_short");

    const displayName =
      sessionUser?.name ||
      sessionUser?.fullName ||
      [sessionUser?.firstName, sessionUser?.lastName].filter(Boolean).join(" ") ||
      email.split("@")[0];

    setWelcomeUser({
      name: displayName,
      role: getRoleLabel(sessionUser?.role, "User"),
      lastLogin: (sessionUser as Record<string, unknown> | undefined)?.lastLoginAt as
        | string
        | undefined,
    });
    setShowWelcome(true);
  };

  const startMfaSetup = (session: AuthSession) => {
    sessionStorage.setItem("mfaSetupToken", session.mfaToken || "");
    sessionStorage.setItem("mfaOtpauthUrl", session.otpauthUrl || "");
    sessionStorage.setItem("mfaUserEmail", session.user.email);
    router.push("/mfa-setup");
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!email || !password) {
        setError("Enter email and password.");
        return;
      }
      const session = await login({ email, password });

      if (session.requiresMfaSetup) {
        startMfaSetup(session);
        return;
      }

      if (session.requiresMfa) {
        if (!session.mfaToken) {
          throw new Error("The server did not return an MFA challenge. Please sign in again.");
        }
        setMfaChallenge(session.mfaToken);
        setMfaCode("");
        setError("");
        return;
      }

      if (privacyMode) setPassword("");
      setLoginSuccess(true);

      router.prefetch(returnUrl);
      await new Promise((r) => setTimeout(r, 200));
      revealWelcome(session.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      setLoginSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!mfaChallenge) return;

    setError("");
    setLoading(true);
    try {
      const session = await verifyMfaLogin(mfaChallenge, mfaCode.trim());
      setMfaChallenge(null);
      if (privacyMode) setPassword("");
      setLoginSuccess(true);
      router.prefetch(returnUrl);
      await new Promise((r) => setTimeout(r, 200));
      revealWelcome(session.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to verify the code.";
      setError(message);
      // An expired challenge cannot be retried with the same token.
      if (err instanceof ApiError && err.code === "MFA_CHALLENGE_EXPIRED") {
        setMfaChallenge(null);
      }
    } finally {
      setLoading(false);
    }
  }

  const isShortMode = useCallback((): boolean => {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem("lc_welcome_short") === "1";
  }, []);


  return (
    <>
      {/* ── Welcome Transition Overlay ── */}
      {showWelcome && welcomeUser && (
        <WelcomeTransition
          userName={welcomeUser.name}
          role={welcomeUser.role}
          lastLoginTime={welcomeUser.lastLogin}
          quickStat={undefined}
          shortMode={isShortMode()}
          onComplete={() => {
            setShowWelcome(false);
            const target = (returnUrl && !returnUrl.startsWith("/login") && returnUrl !== "/") ? returnUrl : "/dashboard";
            router.push(target);
          }}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes orbFloat1  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(0.97)} }
        @keyframes orbFloat2  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,40px) scale(1.03)} 66%{transform:translate(20px,-15px) scale(0.98)} }
        @keyframes orbFloat3  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-25px)} }
        @keyframes scanBeam   { 0%{top:-2px;opacity:0} 5%{opacity:1} 95%{opacity:0.8} 100%{top:100%;opacity:0} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes shimmerText{
          0%   {background-position:-200% center}
          100% {background-position:200% center}
        }
        @keyframes successPop {
          0%  {transform:scale(0.8);opacity:0}
          60% {transform:scale(1.08)}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes typewriter {
          from{width:0} to{width:100%}
        }
        @keyframes blink {
          50%{opacity:0}
        }
        @keyframes borderRotate {
          0%   { --border-angle: 0deg; }
          100% { --border-angle: 360deg; }
        }
        @keyframes floatMolecule {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes floatBadge {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes cardFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.95); }
          to   { opacity:1; transform:scale(1); }
        }

        .login-root  { font-family:'Inter',system-ui,sans-serif; }
        .mono        { font-family:'JetBrains Mono',monospace; }

        .neon-text {
          background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 40%, #818cf8 70%, #38bdf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerText 5s linear infinite;
        }

        .gradient-border-card {
          position: relative;
          z-index: 1;
        }
        .gradient-border-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.2), rgba(56,189,248,0.15), rgba(99,102,241,0.4));
          background-size: 300% 300%;
          animation: gradientShift 8s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: -1;
          pointer-events: none;
        }
        .gradient-border-card:hover::before {
          background: linear-gradient(135deg, rgba(99,102,241,0.6), rgba(139,92,246,0.4), rgba(56,189,248,0.3), rgba(99,102,241,0.6));
        }

        .input-wrap {
          position:relative;
          border-radius:12px;
          transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
        }
        .input-wrap:hover {
          background:rgba(255,255,255,0.04);
          border-color:rgba(255,255,255,0.12);
        }
        .input-wrap.focused {
          border-color:rgba(99,102,241,0.6);
          background:rgba(99,102,241,0.04);
          box-shadow:0 0 0 3px rgba(99,102,241,0.12), 0 0 24px rgba(99,102,241,0.08);
        }
        .input-wrap input {
          background:transparent;
          width:100%;
          outline:none;
          color:#f1f5f9;
          font-size:13.5px;
          letter-spacing:0.01em;
        }
        .input-wrap input::placeholder { color:rgba(255,255,255,0.18); }

        .btn-primary {
          background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#6d28d9 100%);
          border:1px solid rgba(139,92,246,0.4);
          transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
          position:relative;
          overflow:hidden;
        }
        .btn-primary::before {
          content:'';
          position:absolute;
          inset:0;
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.1) 50%,transparent 100%);
          transform:translateX(-100%);
          transition:transform 0.6s;
        }
        .btn-primary:hover::before { transform:translateX(100%); }
        .btn-primary:hover:not(:disabled) {
          box-shadow:0 0 50px rgba(99,102,241,0.5), 0 16px 48px rgba(79,46,229,0.4);
          border-color:rgba(139,92,246,0.7);
          transform:translateY(-1px);
        }
        .btn-primary:active:not(:disabled) {
          transform:translateY(0);
          box-shadow:0 0 30px rgba(99,102,241,0.3);
        }
        .btn-primary:disabled { opacity:0.55; cursor:not-allowed; }

        .success-state {
          animation: successPop 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .card-glow {
          box-shadow:0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      <div className="login-root min-h-screen flex bg-[#050508] relative overflow-hidden">
        <SciFiBackground />

        {/* ────────────────────────────────────────────────────────
            TOP STATUS BAR
        ──────────────────────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(5,5,8,0.6)",
            backdropFilter: "blur(16px)",
            animation: "slideDown 0.5s ease both",
          }}>
          <div className="flex items-center gap-2.5">
            <LabCoreLogo size="sm" variant="compact" theme="dark" />
            <div className="h-3 w-px bg-white/10" />
            <span className="text-white/30 text-[10px] mono">v4.2.1 Enterprise</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMasterModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 hover:border-indigo-500/60 transition-all cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.2)]"
              title="Software Owner Master Provisioning Portal"
            >
              <ShieldCheck className="h-3 w-3 text-indigo-400" />
              <span>Master Registration Portal</span>
            </button>
            <SystemStatusBar />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            FLOATING BADGES (decorative, desktop only)
        ════════════════════════════════════════════════════════ */}
        <FloatingBadge icon={Shield} text="256-BIT AES" position="top-20 left-[8%]" delay="0s" />
        <FloatingBadge icon={Heart} text="99.99% UPTIME" position="bottom-32 left-[12%]" delay="1s" />
        <FloatingBadge icon={GitBranch} text="GENOMICS READY" position="top-28 right-[8%]" delay="2s" />
        <FloatingBadge icon={Scan} text="BARCODE SCAN" position="bottom-24 right-[10%]" delay="0.5s" />

        {/* ════════════════════════════════════════════════════════
            LEFT PANEL
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col justify-between relative z-10 px-14 pt-28 pb-14"
          style={{ width: "50%" }}>

          {/* Headline */}
          <div style={{ animation: "slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.15s" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                backdropFilter: "blur(8px)",
              }}>
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-indigo-300/80 text-[11px] font-semibold tracking-wider uppercase mono">Next-Gen LIMS</span>
              <div className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse" />
            </div>

            <h1 className="text-[56px] font-black leading-[1.02] tracking-[-0.035em] text-white">
              Precision<br />
              <span className="neon-text">Lab OS</span><br />
              <span className="text-white/25 text-[32px] font-light tracking-tight">
                for{" "}
                <TypingText
                  texts={["modern labs.", "clinical excellence.", "diagnostics.", "pathology."]}
                  className="text-white/40"
                />
              </span>
            </h1>

            <p className="mt-6 text-white/30 text-sm leading-relaxed max-w-[400px]">
              Order management, sample tracking, result approvals, and report delivery — unified in a single intelligent
              platform built for clinical excellence.
            </p>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 mt-8">
              {[
                { value: "1M+", label: "Reports/Year" },
                { value: "99.9%", label: "Accuracy" },
                { value: "< 2s", label: "TAT" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-black text-white/80 font-mono">{stat.value}</div>
                  <div className="text-[9px] text-white/25 uppercase tracking-widest mono mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System metrics */}
          <div className="space-y-1" style={{ animation: "slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.3s" }}>
            <p className="text-[10px] text-white/20 uppercase tracking-widest mono mb-3 flex items-center gap-2">
              <Activity className="h-3 w-3 text-indigo-400/40" />
              Live System Metrics
            </p>
            <div className="space-y-2.5 max-w-[360px]">
              <MetricCard icon={FlaskConical} label="Orders Processed Today" value="84%" subtext="↑ 12% from yesterday" color="bg-indigo-500/15 text-indigo-300" gradient="#6366f1" delay="0.4s" />
              <MetricCard icon={Activity}    label="Sample TAT Compliance" value="97%" subtext="Target: 95%" color="bg-violet-500/15 text-violet-300" gradient="#8b5cf6" delay="0.5s" />
              <MetricCard icon={BarChart3}   label="Revenue Collected"     value="76%" subtext="₹4.2L collected today" color="bg-emerald-500/15 text-emerald-300" gradient="#10b981" delay="0.6s" />
              <MetricCard icon={ShieldCheck} label="Security Score"        value="99%" subtext="All checks passed" color="bg-sky-500/15 text-sky-300" gradient="#38bdf8" delay="0.7s" />
            </div>
          </div>

          {/* Bottom tags */}
          <div className="flex items-center gap-3 flex-wrap" style={{ animation: "slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both 0.5s" }}>
            {[
              { label: "NABH Ready", icon: ShieldCheck },
              { label: "HL7 FHIR", icon: Zap },
              { label: "ISO 15189", icon: Shield },
              { label: "HIPAA", icon: Lock },
            ].map((t) => (
              <span key={t.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold mono group cursor-default transition-all duration-300 hover:bg-white/[0.06]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.3)",
                }}>
                <t.icon className="h-3 w-3 text-indigo-400/40 group-hover:text-indigo-400/70 transition-colors" />
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Vertical divider with gradient */}
        <div className="hidden lg:block absolute top-0 bottom-0 w-px"
          style={{
            left: "50%",
            background: "linear-gradient(to bottom, transparent 5%, rgba(99,102,241,0.3) 20%, rgba(139,92,246,0.2) 50%, rgba(99,102,241,0.3) 80%, transparent 95%)",
          }} />

        {/* ════════════════════════════════════════════════════════
            RIGHT PANEL — LOGIN FORM
        ════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex items-center justify-center relative z-10 px-6 pt-20 pb-10">
          <div className="w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8" style={{ animation: "slideUp 0.6s ease both" }}>
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl text-white font-black text-lg mb-3"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}>
                LC
              </div>
              <h2 className="text-2xl font-black text-white">LabCore ELIS</h2>
              <p className="text-white/25 text-xs mt-1">Precision Lab OS</p>
            </div>

            {/* Card with animated gradient border */}
            <div
              className="gradient-border-card rounded-2xl p-7 card-glow relative"
              onMouseEnter={() => setCardHovered(true)}
              onMouseLeave={() => setCardHovered(false)}
              style={{
                background: "rgba(10,10,18,0.92)",
                backdropFilter: "blur(40px)",
                animation: mounted ? "scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both 0.15s" : "none",
                transition: "box-shadow 0.4s ease",
                boxShadow: cardHovered
                  ? "0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}>

              {/* Card top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-px overflow-hidden rounded-t-2xl">
                <div className="h-full w-1/3"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(139,92,246,0.6), transparent)",
                    animation: "shimmerLine 3s ease-in-out infinite",
                  }} />
              </div>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      {loginSuccess ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          Access Granted
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-5 w-5 text-indigo-400/60" />
                          Authenticate
                        </>
                      )}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400/80 text-[10px] mono font-semibold">SECURE</span>
                  </div>
                </div>
                <p className="text-white/25 text-xs mono">Enter credentials to access ELIS workspace</p>
              </div>

              {/* Success overlay */}
              {loginSuccess && (
                <div className="py-10 text-center success-state">
                  <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center relative"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-2xl" style={{
                      border: "1px solid rgba(16,185,129,0.3)",
                      animation: "pulseRing 1.5s ease-out infinite",
                    }} />
                    <div className="absolute inset-0 rounded-2xl" style={{
                      border: "1px solid rgba(16,185,129,0.2)",
                      animation: "pulseRing 1.5s ease-out 0.5s infinite",
                    }} />
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-white font-bold text-lg">Identity Verified</p>
                  <p className="text-white/30 text-xs mt-1.5 mono flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Routing to dashboard…
                  </p>
                </div>
              )}

              {!loginSuccess && (
                <>
                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        animation: "fadeIn 0.3s ease both",
                      }}>
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-300/90 leading-relaxed">{error}</p>
                    </div>
                  )}

                  <form onSubmit={mfaChallenge ? handleMfaSubmit : handleSubmit} className="space-y-4">

                    {mfaChallenge ? (
                      /* ── Second factor ── */
                      <div>
                        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mono mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="h-3 w-3 text-indigo-400/40" />
                          Authenticator Code
                        </label>
                        <div className={`input-wrap ${passwordFocused ? "focused" : ""}`}>
                          <div className="flex items-center px-4 py-3.5">
                            <Lock className="h-4 w-4 mr-3 shrink-0 text-white/20" />
                            <input
                              id="login-mfa-code"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={8}
                              value={mfaCode}
                              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                              onFocus={() => setPasswordFocused(true)}
                              onBlur={() => setPasswordFocused(false)}
                              placeholder="123456"
                              required
                              autoFocus
                              autoComplete="one-time-code"
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-[10px] text-white/25 mono">
                          Enter the 6-digit code from your authenticator app, or a backup code.
                        </p>
                        <button
                          type="button"
                          onClick={() => { setMfaChallenge(null); setMfaCode(""); setError(""); }}
                          className="mt-2 text-[11px] text-indigo-400/60 hover:text-indigo-300 transition-colors mono"
                        >
                          Use a different account
                        </button>
                      </div>
                    ) : (
                      <>
                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mono mb-2 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-indigo-400/40" />
                        Operator Email
                      </label>
                      <div className={`input-wrap ${emailFocused ? "focused" : ""}`}>
                        <div className="flex items-center px-4 py-3.5">
                          <Mail className="h-4 w-4 mr-3 shrink-0 transition-colors duration-300" style={{ color: emailFocused ? "#818cf8" : "rgba(255,255,255,0.2)" }} />
                          <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); passwordRef.current?.focus(); } }}
                            placeholder="operator@labcore.com"
                            required
                            autoComplete="username"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-widest mono mb-2 flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-indigo-400/40" />
                        Access Key
                      </label>
                      <div className={`input-wrap ${passwordFocused ? "focused" : ""}`}>
                        <div className="flex items-center px-4 py-3.5">
                          <Lock className="h-4 w-4 mr-3 shrink-0 transition-colors duration-300" style={{ color: passwordFocused ? "#818cf8" : "rgba(255,255,255,0.2)" }} />
                          <input
                            id="login-password"
                            ref={passwordRef}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            placeholder="••••••••••••"
                            required
                            autoComplete="current-password"
                          />
                          <button type="button" id="toggle-password-visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-2 shrink-0 text-white/20 hover:text-white/60 transition-colors p-1 rounded-lg hover:bg-white/5">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <PasswordStrength password={password} />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <button type="button"
                        onClick={() => { const n = !rememberMe; setRememberMeState(n); setRememberMe(n); }}
                        className="flex items-center gap-2 group">
                        <div className="h-4 w-4 rounded flex items-center justify-center transition-all duration-300"
                          style={{
                            background: rememberMe ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(255,255,255,0.04)",
                            border: rememberMe ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
                            boxShadow: rememberMe ? "0 0 10px rgba(99,102,241,0.3)" : "none",
                          }}>
                          {rememberMe && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[11px] text-white/30 group-hover:text-white/60 transition-colors select-none mono">
                          Keep session
                        </span>
                      </button>
                      <a href="#" className="text-[11px] text-indigo-400/60 hover:text-indigo-300 transition-colors mono flex items-center gap-1">
                        Reset access key <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Biometric */}
                    {biometricAvailable && (
                      <button type="button" id="biometric-login-btn"
                        onClick={handleBiometricLogin}
                        disabled={biometricLoading}
                        className="w-full py-3 rounded-xl text-xs text-white/50 hover:text-white/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white/[0.04]"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                        {biometricLoading
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning…</>
                          : <><Fingerprint className="h-3.5 w-3.5 text-indigo-400/60" /> Biometric login</>}
                      </button>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                      <span className="text-[10px] text-white/15 uppercase tracking-widest mono flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-indigo-400/20" />
                        authenticate
                      </span>
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                    </div>
                      </>
                    )}

                    {/* Submit button with pulse rings */}
                    <div className="relative">
                      <button id="login-submit-btn" type="submit" disabled={loading || Boolean(mfaChallenge && mfaCode.length < 6)}
                        className="btn-primary w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2.5 relative z-10">
                        {loading
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> {mfaChallenge ? "Verifying…" : "Authenticating…"}</>
                          : <>
                              <ShieldCheck className="h-4 w-4 opacity-70" />
                              <span>{mfaChallenge ? "Verify And Enter" : "Access Workspace"}</span>
                              <ChevronRight className="h-4 w-4 opacity-60" />
                            </>}
                      </button>
                    </div>
                  </form>

                  {/* Footer encryption notice */}
                  <div className="mt-6 pt-4 flex items-center justify-center gap-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    {[
                      { icon: ShieldCheck, text: "E2E Encrypted" },
                      { icon: Lock, text: "Zero-Trust" },
                      { icon: Cpu, text: "MFA Ready" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-1.5 group cursor-default">
                        <Icon className="h-3 w-3 text-indigo-400/25 group-hover:text-indigo-400/50 transition-colors" />
                        <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors mono">{text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Privacy & Master Provisioning Controls */}
            <div className="mt-4 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-3">
                <button type="button"
                  onClick={() => { const n = !privacyMode; setPrivacyModeState(n); setPrivacyMode(n); }}
                  className="flex items-center gap-2 group px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/[0.03]">
                  <div className="h-3.5 w-3.5 rounded transition-all duration-300"
                    style={{
                      background: privacyMode ? "rgba(99,102,241,0.4)" : "transparent",
                      border: privacyMode ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: privacyMode ? "0 0 6px rgba(99,102,241,0.3)" : "none",
                    }} />
                  <span className="text-[10px] text-white/15 group-hover:text-white/40 transition-colors mono select-none">
                    privacy mode
                  </span>
                </button>

                <div className="h-3 w-px bg-white/10" />

                <button
                  type="button"
                  onClick={() => setShowMasterModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] text-indigo-400/80 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all cursor-pointer mono"
                >
                  <Shield className="h-3 w-3 text-indigo-400" />
                  <span>Master Lab & Role Setup</span>
                </button>
              </div>
            </div>

            <p className="text-center text-white/8 text-[10px] mt-5 mono tracking-widest uppercase">
              © {new Date().getFullYear()} LabCore ELIS · SECURED SESSION
            </p>
          </div>
        </div>
      </div>

      {/* Software Owner Master Lab & Role Provisioning Portal */}
      <MasterRegistrationModal
        isOpen={showMasterModal}
        onClose={() => setShowMasterModal(false)}
        onAutoFillLogin={(e, p) => {
          setEmail(e);
          setPassword(p);
        }}
        onDirectLogin={(u) => {
          setLoginSuccess(true);
          setError("");
          const TODAY_KEY = "lc_last_welcome_date";
          const todayStr = new Date().toDateString();
          const isRepeat = sessionStorage.getItem(TODAY_KEY) === todayStr;
          sessionStorage.setItem(TODAY_KEY, todayStr);
          if (isRepeat) sessionStorage.setItem("lc_welcome_short", "1");
          else sessionStorage.removeItem("lc_welcome_short");
          router.prefetch(returnUrl);
          setWelcomeUser({
            name: u.name,
            role: getRoleLabel(u.role, "Staff"),
            lastLogin: u.lastLogin,
          });
          setShowWelcome(true);
        }}
      />
    </>
  );
}
