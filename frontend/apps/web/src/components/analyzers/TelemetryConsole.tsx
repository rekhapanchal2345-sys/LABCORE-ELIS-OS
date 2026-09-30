"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Activity, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  Trash2,
  Download,
  Settings,
  Filter
} from "lucide-react";
import { analyzersApi } from "@/lib/api";

interface TelemetryMessage {
  id: string;
  timestamp: Date;
  analyzerId: string;
  analyzerName: string;
  protocol: string;
  direction: "INCOMING" | "OUTGOING";
  messageType: string;
  rawMessage: string;
  parsedData?: any;
  status: "SUCCESS" | "FAILED" | "TIMEOUT";
}

interface TelemetryConsoleProps {
  analyzerId?: string;
  onClose?: () => void;
}

export default function TelemetryConsole({ analyzerId, onClose }: TelemetryConsoleProps) {
  const [messages, setMessages] = useState<TelemetryMessage[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTED" | "DISCONNECTED">("DISCONNECTED");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate live telemetry data
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const demoMessages: TelemetryMessage[] = [
        {
          id: `msg-${Date.now()}`,
          timestamp: new Date(),
          analyzerId: analyzerId || "SYS-001",
          analyzerName: "Sysmex XN-550",
          protocol: "ASTM",
          direction: "INCOMING",
          messageType: "RESULT",
          rawMessage: "H|\\^&|||Sysmex||||2024-09-01\rR|1|SMP-90210|WBC_CONC|7.5|10^9/L|4.0-11.0|N||2024-09-01 10:30:45",
          parsedData: {
            type: "RESULT",
            testCode: "WBC_CONC",
            value: "7.5",
            unit: "10^9/L",
            referenceRange: "4.0-11.0",
            flag: "N"
          },
          status: "SUCCESS"
        },
        {
          id: `msg-${Date.now() + 1}`,
          timestamp: new Date(),
          analyzerId: analyzerId || "ROC-001",
          analyzerName: "Roche Cobas c311",
          protocol: "HL7",
          direction: "INCOMING",
          messageType: "OBX",
          rawMessage: "OBX|1|NM|GLU^Glucose||105|mg/dL|70-99|H||F",
          parsedData: {
            segment: "OBX",
            observationIdentifier: "NM",
            universalServiceId: "GLU^Glucose",
            observationValue: "105",
            unit: "mg/dL",
            referenceRange: "70-99",
            abnormalFlag: "H",
            observationStatus: "F"
          },
          status: "SUCCESS"
        },
        {
          id: `msg-${Date.now() + 2}`,
          timestamp: new Date(),
          analyzerId: analyzerId || "MIN-001",
          analyzerName: "Mindray BS-240",
          protocol: "ASTM",
          direction: "OUTGOING",
          messageType: "QUERY",
          rawMessage: "H|\\^&|||LIMS||Mindray||2024-09-01\rQ|1|SMP-90211",
          parsedData: {
            type: "QUERY",
            sampleId: "SMP-90211"
          },
          status: "SUCCESS"
        }
      ];

      const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
      setMessages(prev => [...prev.slice(-99), randomMessage]);
      setConnectionStatus("CONNECTED");
    }, 2000); // New message every 2 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, analyzerId]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setConnectionStatus("DISCONNECTED");
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const exportMessages = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `telemetry-export-${new Date().toISOString()}.json`;
    link.click();
  };

  const filteredMessages = filter === "ALL" 
    ? messages 
    : messages.filter(msg => msg.direction === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "text-green-400";
      case "FAILED": return "text-red-400";
      case "TIMEOUT": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case "ASTM": return "text-blue-400";
      case "HL7": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Console Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-green-400" />
            <div>
              <h3 className="text-white font-semibold">Live Telemetry Console</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {connectionStatus === "CONNECTED" ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-400">Disconnected</span>
                  </>
                )}
                <span>•</span>
                <span>{filteredMessages.length} messages</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 text-white text-sm border border-gray-600 rounded px-2 py-1"
            >
              <option value="ALL">All Messages</option>
              <option value="INCOMING">Incoming Only</option>
              <option value="OUTGOING">Outgoing Only</option>
            </select>

            {/* Monitor Toggle */}
            <button
              onClick={toggleMonitoring}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isMonitoring 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>

            {/* Clear */}
            <button
              onClick={clearMessages}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>

            {/* Export */}
            <button
              onClick={exportMessages}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {/* Settings */}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
            </button>

            {/* Close */}
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Console Body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Terminal className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">
              {isMonitoring ? "Waiting for messages..." : "Click Start to begin monitoring"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="bg-gray-800 rounded p-3 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`text-xs font-medium ${getProtocolColor(message.protocol)}`}>
                      {message.protocol}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      message.direction === "INCOMING" 
                        ? "bg-blue-900 text-blue-300" 
                        : "bg-green-900 text-green-300"
                    }`}>
                      {message.direction}
                    </span>
                    <span className="text-xs text-gray-300">
                      {message.messageType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.analyzerName}
                    </span>
                  </div>
                </div>

                {/* Raw Message */}
                <div className="bg-gray-900 rounded p-2 mb-2 overflow-x-auto">
                  <code className="text-green-400 text-xs whitespace-pre-wrap">
                    {message.rawMessage}
                  </code>
                </div>

                {/* Parsed Data */}
                {message.parsedData && (
                  <div className="bg-gray-900 rounded p-2">
                    <div className="text-gray-400 text-xs mb-1">Parsed Data:</div>
                    <pre className="text-yellow-400 text-xs overflow-x-auto">
                      {JSON.stringify(message.parsedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Console Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Total: {messages.length}</span>
            <span className="text-green-400">Success: {messages.filter(m => m.status === "SUCCESS").length}</span>
            <span className="text-red-400">Failed: {messages.filter(m => m.status === "FAILED").length}</span>
            <span className="text-yellow-400">Timeout: {messages.filter(m => m.status === "TIMEOUT").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>Live Feed Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}