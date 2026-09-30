"use client";

import React, { useState } from "react";
import {
  Network,
  Cpu,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Server,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Search,
  Sliders,
  Radio,
  Clock,
  Sparkles
} from "lucide-react";
import { Analyzer } from "@/types";

export interface DriverProfile {
  id: string;
  manufacturer: string;
  model: string;
  protocol: "ASTM_E1394" | "HL7_V25" | "ASTM_E1381" | "CUSTOM_SERIAL";
  connectionMode: "TCP_IP" | "RS232_SERIAL" | "HYBRID";
  defaultPort: number;
  baudRate?: number;
  parity?: string;
  dataBits?: number;
  stopBits?: number;
  bidirectionalSupport: boolean;
  handshakeType: "ENQ_ACK" | "MLLP_BLOCK" | "RTS_CTS";
  checksumAlgorithm: "MODULO_256_HEX" | "LRC" | "NONE";
  status: "READY" | "CERTIFIED" | "BETA";
  installedCount: number;
  sampleHeader: string;
  sampleResult: string;
}

interface MiddlewareDriverHubProps {
  analyzers?: Analyzer[];
}

export default function MiddlewareDriverHub({ analyzers = [] }: MiddlewareDriverHubProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "packet_debugger" | "handshake_simulator">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Checksum Live Calculator State
  const [rawPayload, setRawPayload] = useState(
    "1H|\\^&|||Sysmex_XN550|||||||P|1394-97|20260907143000\r"
  );

  // Handshake Step Simulation State
  const [handshakeStep, setHandshakeStep] = useState<number>(0);
  const [isRunningHandshake, setIsRunningHandshake] = useState(false);
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);

  // Driver Catalog Data
  const [drivers, setDrivers] = useState<DriverProfile[]>([
    {
      id: "DRV-SYS-XN",
      manufacturer: "Sysmex",
      model: "XN-Series (XN-550 / XN-1000 / XN-2000)",
      protocol: "ASTM_E1394",
      connectionMode: "TCP_IP",
      defaultPort: 5000,
      bidirectionalSupport: true,
      handshakeType: "ENQ_ACK",
      checksumAlgorithm: "MODULO_256_HEX",
      status: "CERTIFIED",
      installedCount: 4,
      sampleHeader: "H|\\^&|||Sysmex_XN|||||||P|1394-97",
      sampleResult: "R|1|^^^WBC|7.8|10*3/uL|4.0-11.0|N||F",
    },
    {
      id: "DRV-ROC-COBAS",
      manufacturer: "Roche Diagnostics",
      model: "Cobas 6000 / c311 / c501 / e601",
      protocol: "HL7_V25",
      connectionMode: "TCP_IP",
      defaultPort: 5100,
      bidirectionalSupport: true,
      handshakeType: "MLLP_BLOCK",
      checksumAlgorithm: "NONE",
      status: "CERTIFIED",
      installedCount: 3,
      sampleHeader: "MSH|^~\\&|Cobas_c311|ROCHE|LabCoreLIS|CORE|20260907143000||ORU^R01|MSG001|P|2.5",
      sampleResult: "OBX|1|NM|GLU^Glucose||98|mg/dL|70-99|N|||F",
    },
    {
      id: "DRV-ABB-ARCH",
      manufacturer: "Abbott Laboratories",
      model: "Architect ci8200 / i2000SR / c4000",
      protocol: "ASTM_E1394",
      connectionMode: "TCP_IP",
      defaultPort: 5200,
      bidirectionalSupport: true,
      handshakeType: "ENQ_ACK",
      checksumAlgorithm: "MODULO_256_HEX",
      status: "CERTIFIED",
      installedCount: 2,
      sampleHeader: "H|\\^&|||Architect_i2000|||||||P|1394-97",
      sampleResult: "R|1|^^^TROP_I|0.012|ng/mL|0.000-0.034|N||F",
    },
    {
      id: "DRV-BECK-AU",
      manufacturer: "Beckman Coulter",
      model: "AU480 / AU680 / Access 2 Immunoassay",
      protocol: "ASTM_E1394",
      connectionMode: "RS232_SERIAL",
      defaultPort: 9600,
      baudRate: 9600,
      parity: "None",
      dataBits: 8,
      stopBits: 1,
      bidirectionalSupport: true,
      handshakeType: "ENQ_ACK",
      checksumAlgorithm: "MODULO_256_HEX",
      status: "CERTIFIED",
      installedCount: 1,
      sampleHeader: "H|\\^&|||Beckman_AU480|||||||P|1394-97",
      sampleResult: "R|1|^^^SGOT|28|U/L|10-40|N||F",
    },
    {
      id: "DRV-MIND-BC",
      manufacturer: "Mindray Medical",
      model: "BC-6800 / BS-240 / BS-480",
      protocol: "HL7_V25",
      connectionMode: "TCP_IP",
      defaultPort: 5300,
      bidirectionalSupport: true,
      handshakeType: "MLLP_BLOCK",
      checksumAlgorithm: "NONE",
      status: "CERTIFIED",
      installedCount: 2,
      sampleHeader: "MSH|^~\\&|Mindray_BC6800||LabCoreLIS||20260907143000||ORU^R01|MSG009|P|2.5",
      sampleResult: "OBX|1|NM|PLT^Platelets||240|10*3/uL|150-450|N|||F",
    },
    {
      id: "DRV-BIOM-VITEK",
      manufacturer: "bioMérieux",
      model: "VITEK 2 Compact (Microbiology ID/AST)",
      protocol: "CUSTOM_SERIAL",
      connectionMode: "RS232_SERIAL",
      defaultPort: 19200,
      baudRate: 19200,
      parity: "Even",
      dataBits: 7,
      stopBits: 1,
      bidirectionalSupport: true,
      handshakeType: "ENQ_ACK",
      checksumAlgorithm: "LRC",
      status: "CERTIFIED",
      installedCount: 1,
      sampleHeader: "H|\\^&|||VITEK2_COMPACT|||||||P|BCI",
      sampleResult: "R|1|^^^ORGANISM|Escherichia coli|||||F",
    },
  ]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Modulo-256 Checksum Calculator (Standard ASTM E1381/E1394 algorithm)
  const calculateASTMChecksum = (payload: string): string => {
    let sum = 0;
    for (let i = 0; i < payload.length; i++) {
      sum = (sum + payload.charCodeAt(i)) % 256;
    }
    const hex = sum.toString(16).toUpperCase();
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const calculatedChecksum = calculateASTMChecksum(rawPayload);

  // Interactive Bidirectional ASTM Handshake Stepper
  const startHandshakeSimulation = () => {
    setIsRunningHandshake(true);
    setHandshakeStep(1);
    setHandshakeLogs(["[14:32:00.102] TX ➔ Analyzer sends <ENQ> (0x05) to LIS Socket 5000..."]);

    setTimeout(() => {
      setHandshakeStep(2);
      setHandshakeLogs((prev) => [
        ...prev,
        "[14:32:00.124] RX ➔ LabCore LIS acknowledges: <ACK> (0x06) sent to Analyzer.",
      ]);

      setTimeout(() => {
        setHandshakeStep(3);
        setHandshakeLogs((prev) => [
          ...prev,
          "[14:32:00.180] TX ➔ Analyzer transmits Header & Barcode Query: Q|1|^BARCODE_8812||ALL",
        ]);

        setTimeout(() => {
          setHandshakeStep(4);
          setHandshakeLogs((prev) => [
            ...prev,
            "[14:32:00.245] RX ➔ LIS matches MRN-9912. Dispatches Order: O|1|BARCODE_8812||^^^CBC_DIFF|R",
          ]);

          setTimeout(() => {
            setHandshakeStep(5);
            setHandshakeLogs((prev) => [
              ...prev,
              "[14:32:00.310] TX ➔ Transmission finalized: <EOT> (0x04). Tube accepted into Analyzer Carousel!",
            ]);
            setIsRunningHandshake(false);
            showNotification("Full bidirectional handshake verified successfully (208ms cycle)!");
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const filteredDrivers = drivers.filter((d) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.manufacturer.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.protocol.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-950 via-[#07132a] to-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/15 px-3 py-1 text-[11px] font-bold text-blue-300">
                <Network className="h-3.5 w-3.5 text-blue-400" />
                ASTM E1381 / E1394 & HL7 v2.5 Middleware
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Certified Driver Catalog
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              LIS Bi-Directional Driver & Protocol Middleware Hub
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Plug-and-play laboratory instrument connectivity. Select certified hardware driver profiles for Sysmex, Roche, Abbott, and Mindray, inspect raw ASTM/HL7 packet checksums, and test live ENQ/ACK query handshakes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("handshake_simulator")}
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-400/40 bg-blue-500/20 px-4 py-2.5 text-xs font-bold text-blue-200 hover:bg-blue-500/30 transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-blue-300" />
              Handshake Simulator
            </button>
            <button
              onClick={() => setActiveTab("packet_debugger")}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Terminal className="h-4 w-4" />
              Packet & Checksum Debugger
            </button>
          </div>
        </div>

        {/* Quick Driver Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certified Drivers</p>
              <p className="text-sm font-black text-white">{drivers.length} Manufacturers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bidirectional Query</p>
              <p className="text-sm font-black text-emerald-300">Supported (100%)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Protocols</p>
              <p className="text-sm font-black text-cyan-300">ASTM / HL7 / MLLP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Checksum Mode</p>
              <p className="text-sm font-black text-indigo-300">Modulo-256 Hex</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "catalog"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>Manufacturer Driver Catalog ({drivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("packet_debugger")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "packet_debugger"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Packet & Checksum Inspector</span>
          <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab("handshake_simulator")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "handshake_simulator"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Bidirectional ASTM Handshake Stepper</span>
        </button>
      </div>

      {/* VIEW 1: DRIVER CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search driver by manufacturer (Sysmex, Roche, Abbott, Mindray)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredDrivers.length}</strong> verified driver templates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-xl transition-all duration-300 hover:border-blue-500/50"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[9px] font-bold text-blue-300">
                        {driver.protocol.replace("_", " ")}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-white leading-tight">{driver.manufacturer}</h3>
                      <p className="text-xs text-slate-300">{driver.model}</p>
                    </div>

                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                      {driver.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Transport:</span>
                      <span className="text-cyan-300">{driver.connectionMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Default Port:</span>
                      <span className="text-white">{driver.defaultPort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Handshake:</span>
                      <span className="text-amber-300">{driver.handshakeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Checksum:</span>
                      <span className="text-indigo-300">{driver.checksumAlgorithm}</span>
                    </div>
                  </div>

                  {/* Sample Frame Snippet */}
                  <div className="mt-3 rounded-xl bg-black/60 p-2.5 font-mono text-[10px] text-slate-400 border border-slate-800 truncate">
                    {driver.sampleResult}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-[11px] text-slate-400">
                    Active: <strong className="text-white">{driver.installedCount} instruments</strong>
                  </span>
                  <button
                    onClick={() => {
                      setRawPayload(driver.sampleResult);
                      setActiveTab("packet_debugger");
                      showNotification(`Loaded ${driver.model} test frame into debugger`);
                    }}
                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold text-blue-300 hover:bg-blue-500/20 transition-all"
                  >
                    Test Frame →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PACKET & CHECKSUM DEBUGGER */}
      {activeTab === "packet_debugger" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white">Live ASTM / HL7 Frame Constructor</h3>
                <p className="text-xs text-slate-400">Type or paste raw analyzer frames to calculate checksum</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Raw ASCII Frame Content (Between &lt;STX&gt; and &lt;ETX&gt;)</label>
              <textarea
                rows={5}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Calculated Checksum Block */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-300 block">Calculated ASTM Modulo-256 Checksum</span>
                <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                  0x{calculatedChecksum} ({calculatedChecksum})
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                Frame Valid
              </span>
            </div>

            {/* Complete Transmission Frame Preview */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 font-mono text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Complete Physical Serial Wire Transmission</span>
              <div className="rounded-xl bg-black/60 p-3 text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                <span className="text-amber-400 font-bold">&lt;STX&gt;</span>
                <span className="text-cyan-300">{rawPayload.replace(/\r/g, "\\r")}</span>
                <span className="text-amber-400 font-bold">&lt;ETX&gt;</span>
                <span className="text-emerald-400 font-bold">{calculatedChecksum}</span>
                <span className="text-rose-400 font-bold">&lt;CR&gt;&lt;LF&gt;</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Frame Field Tokenizer</h3>
            <p className="text-xs text-slate-400">Automatic segment breakdown of incoming ASTM E1394 fields</p>

            <div className="space-y-2 font-mono text-xs">
              {rawPayload.split("|").map((token, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-2">
                  <span className="text-slate-400 font-sans text-[11px]">Field #{i}:</span>
                  <span className="font-bold text-white truncate max-w-[280px]">
                    {token.length > 0 ? token : "<EMPTY>"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BIDIRECTIONAL HANDSHAKE STEPPER */}
      {activeTab === "handshake_simulator" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Interactive ASTM Bidirectional Query Stepper</h3>
              <p className="text-xs text-slate-400">
                Trace real-time electronic handshakes between physical laboratory machines and LabCore LIS
              </p>
            </div>

            <button
              onClick={startHandshakeSimulation}
              disabled={isRunningHandshake}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play className={`h-4 w-4 ${isRunningHandshake ? "animate-spin" : ""}`} />
              {isRunningHandshake ? "Executing Handshake..." : "Run Interactive Handshake"}
            </button>
          </div>

          {/* 5-Step Visual Stepper Bar */}
          <div className="grid grid-cols-5 gap-3 text-center">
            {[
              { step: 1, title: "1. Instrument <ENQ>", desc: "Requests line control" },
              { step: 2, title: "2. LIS <ACK>", desc: "Socket ready" },
              { step: 3, title: "3. Query Barcode", desc: "Patient tube query" },
              { step: 4, title: "4. Order Response", desc: "Worklist tests returned" },
              { step: 5, title: "5. <EOT> Complete", desc: "Aspiration started" },
            ].map((s) => {
              const isPast = handshakeStep > s.step;
              const isCurrent = handshakeStep === s.step;
              return (
                <div
                  key={s.step}
                  className={`rounded-2xl border p-3 transition-all duration-300 ${
                    isCurrent
                      ? "border-blue-400 bg-blue-950/60 shadow-lg shadow-blue-500/20 scale-105"
                      : isPast
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                      : "border-slate-800 bg-slate-900/60 text-slate-500"
                  }`}
                >
                  <span className="text-[10px] font-bold block">{s.title}</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">{s.desc}</span>
                </div>
              );
            })}
          </div>

          {/* Live Socket Stream Console */}
          <div className="rounded-2xl border border-slate-800 bg-black/80 p-4 font-mono text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">Live TCP Port 5000 Log Stream:</span>
            {handshakeLogs.length === 0 ? (
              <span className="text-slate-600 italic">Click &quot;Run Interactive Handshake&quot; to begin.</span>
            ) : (
              handshakeLogs.map((log, idx) => (
                <div key={idx} className="text-emerald-400">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
