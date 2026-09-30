"use client";

import React from "react";

interface LabCoreLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "compact" | "icon";
  animated?: boolean;
  sparkle?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

export default function LabCoreLogo({
  size = "md",
  variant = "full",
  animated = true,
  sparkle = true,
  className = "",
  theme = "light",
}: LabCoreLogoProps) {
  const rawId = React.useId();
  const id = "lclogo-" + rawId.replace(/:/g, "");

  // Dimensions based on size
  const iconDimensions = {
    sm: { box: "h-8 w-8", px: 32, starSize: "h-3.5 w-3.5 -top-1 -right-1" },
    md: { box: "h-10 w-10", px: 40, starSize: "h-4 w-4 -top-1.5 -right-1.5" },
    lg: { box: "h-12 w-12", px: 48, starSize: "h-5 w-5 -top-2 -right-2" },
    xl: { box: "h-16 w-16", px: 64, starSize: "h-6 w-6 -top-2 -right-2" },
  }[size];

  const textSize = {
    sm: { title: "text-sm", sub: "text-[9px]", badge: "text-[8px] px-1 py-0.2" },
    md: { title: "text-base", sub: "text-[10px]", badge: "text-[9px] px-1.5 py-0.5" },
    lg: { title: "text-lg", sub: "text-[11px]", badge: "text-[10px] px-2 py-0.5" },
    xl: { title: "text-2xl", sub: "text-xs", badge: "text-xs px-2.5 py-1" },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* =========================================================
          ADVANCED SHINING LUXURY EMBLEM (VECTOR + SHIMMER BEAM)
          ========================================================= */}
      <div className={`relative ${iconDimensions.box} flex-shrink-0 flex items-center justify-center`}>
        {/* Pulsing Luminous Backlight Aura */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-400/40 via-indigo-500/30 to-teal-300/30 logo-ambient-aura pointer-events-none" />

        {/* Shimmer Container with Diagonal Light Reflection Beam */}
        <div className="relative w-full h-full logo-shimmer-container rounded-[26%] shadow-lg shadow-sky-500/20">
          {/* Continuous Light Sweep Beam ("Chamak") */}
          {animated && <div className="logo-shimmer-beam" />}

          {/* 3D Geometric Vector Container */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Outer Shield Gradient */}
              <linearGradient id={`${id}-shieldGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="35%" stopColor="#0ea5e9" />
                <stop offset="70%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>

              {/* Specular Top Glass Highlight */}
              <linearGradient id={`${id}-specularGlow`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>

              {/* Golden Core Pulse */}
              <radialGradient id={`${id}-centerCore`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#67e8f9" />
                <stop offset="80%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </radialGradient>
            </defs>

            {/* Outer Rounded Hexagonal / Squircle Shield */}
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="26"
              fill={`url(#${id}-shieldGrad)`}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="2.5"
            />

            {/* Top Glass Specular Overlay */}
            <path
              d="M 6 30 C 6 16.7 16.7 6 30 6 L 70 6 C 83.3 6 94 16.7 94 30 L 94 48 C 65 36 35 42 6 52 Z"
              fill={`url(#${id}-specularGlow)`}
            />

            {/* Stylized Interlocking Clinical Cross & Molecular Nodes */}
            {/* Vertical Cross Bar */}
            <rect
              x="44"
              y="22"
              width="12"
              height="56"
              rx="6"
              fill="#ffffff"
              opacity="0.95"
            />
            {/* Horizontal Cross Bar */}
            <rect
              x="22"
              y="44"
              width="56"
              height="12"
              rx="6"
              fill="#ffffff"
              opacity="0.95"
            />

            {/* Orbiting Diagnostic DNA Molecular Strands */}
            <circle cx="50" cy="22" r="5" fill="#38bdf8" />
            <circle cx="50" cy="78" r="5" fill="#38bdf8" />
            <circle cx="22" cy="50" r="5" fill="#38bdf8" />
            <circle cx="78" cy="50" r="5" fill="#38bdf8" />

            {/* Inner Glowing Diagnostic Core */}
            <circle
              cx="50"
              cy="50"
              r="8.5"
              fill={`url(#${id}-centerCore)`}
              stroke="#ffffff"
              strokeWidth="2.5"
            />

            {/* Center Micro Spark */}
            <circle cx="50" cy="50" r="3" fill="#ffffff" />
          </svg>
        </div>

        {/* 4-Point Diamond Twinkle Sparkle Flare (Top-Right Corner) */}
        {sparkle && (
          <div className={`logo-sparkle-star ${iconDimensions.starSize} flex items-center justify-center`}>
            <svg viewBox="0 0 24 24" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
        )}
      </div>

      {/* =========================================================
          TYPOGRAPHY & BRANDING WITH METALLIC SHIMMER
          ========================================================= */}
      {variant !== "icon" && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${textSize.title} ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Lab<span className="text-shimmer-flow font-black">Core</span>
            </span>

            {/* Enterprise Badge */}
            <span className={`shimmer-badge rounded-md font-extrabold uppercase tracking-widest bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-blue-500/15 border border-sky-400/40 text-sky-700 shadow-2xs ${textSize.badge}`}>
              ELIS
            </span>
          </div>

          {variant === "full" && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`font-bold tracking-[0.18em] uppercase ${textSize.sub} text-slate-400 group-hover:text-slate-600 transition-colors`}>
                ENTERPRISE LIS
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
