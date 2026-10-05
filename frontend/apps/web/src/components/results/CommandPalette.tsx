"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Command, ArrowRight, CheckCircle, FileText, Users, Settings, Download, RefreshCw, RotateCcw, Sparkles, AlertTriangle, ExternalLink, Clock3 } from "lucide-react";
import { formatPatientFullName } from "@/lib/patient-utils";

interface CommandItem {
  id: string;
  type: "result" | "action" | "navigation";
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category?: string;
  result?: any;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  results?: any[];
  onNavigateToResult?: (resultId: string) => void;
  onFilterByStatus?: (status: string) => void;
  onVerifyCurrent?: () => void;
  onApproveCurrent?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onClearFilters?: () => void;
  onEnterResult?: (resultId: string) => void;
  onViewHistory?: (resultId: string) => void;
  onPreviewReport?: (resultId: string) => void;
  currentResultId?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  results = [],
  onNavigateToResult,
  onFilterByStatus,
  onVerifyCurrent,
  onApproveCurrent,
  onRefresh,
  onExport,
  onClearFilters,
  onEnterResult,
  onViewHistory,
  onPreviewReport,
  currentResultId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
        break;
      case "Tab":
        e.preventDefault();
        setSelectedIndex((prev) => filteredItems.length ? (prev + 1) % filteredItems.length : 0);
        break;
    }
  };

  // Build command items
  const buildCommandItems = useCallback((): CommandItem[] => {
    const items: CommandItem[] = [];

    // Navigation actions
    items.push({
      id: "nav-dashboard",
      type: "navigation",
      label: "Go to Dashboard",
      description: "Navigate to the main dashboard",
      icon: <Settings className="w-4 h-4" />,
      shortcut: "G D",
      action: () => {
        window.location.href = "/dashboard";
        onClose();
      },
      category: "Navigation",
    });

    items.push({
      id: "action-refresh",
      type: "action",
      label: "Refresh Result Queue",
      description: "Pull the latest results and workflow status",
      icon: <RefreshCw className="w-4 h-4" />,
      shortcut: "R",
      action: () => {
        onRefresh?.();
        onClose();
      },
      category: "Quick Actions",
    });

    items.push({
      id: "action-export",
      type: "action",
      label: "Export Current View",
      description: "Download the visible results as a CSV file",
      icon: <Download className="w-4 h-4" />,
      shortcut: "E",
      action: () => {
        onExport?.();
        onClose();
      },
      category: "Quick Actions",
    });

    items.push({
      id: "action-clear-filters",
      type: "action",
      label: "Clear All Filters",
      description: "Reset search, status, department and date filters",
      icon: <RotateCcw className="w-4 h-4" />,
      shortcut: "C",
      action: () => {
        onClearFilters?.();
        onClose();
      },
      category: "Quick Actions",
    });

    // Filter actions
    items.push({
      id: "filter-pending",
      type: "action",
      label: "Filter: Pending Results",
      description: "Show only pending results",
      icon: <FileText className="w-4 h-4" />,
      shortcut: "F P",
      action: () => {
        onFilterByStatus?.("PENDING");
        onClose();
      },
      category: "Filters",
    });

    items.push({
      id: "filter-entered",
      type: "action",
      label: "Filter: Entered Results",
      description: "Show only entered results awaiting verification",
      icon: <FileText className="w-4 h-4" />,
      shortcut: "F E",
      action: () => {
        onFilterByStatus?.("ENTERED");
        onClose();
      },
      category: "Filters",
    });

    items.push({
      id: "filter-verified",
      type: "action",
      label: "Filter: Verified Results",
      description: "Show only verified results awaiting approval",
      icon: <CheckCircle className="w-4 h-4" />,
      shortcut: "F V",
      action: () => {
        onFilterByStatus?.("VERIFIED");
        onClose();
      },
      category: "Filters",
    });

    items.push({
      id: "filter-approved",
      type: "action",
      label: "Filter: Approved Results",
      description: "Show only approved results",
      icon: <CheckCircle className="w-4 h-4" />,
      shortcut: "F A",
      action: () => {
        onFilterByStatus?.("APPROVED");
        onClose();
      },
      category: "Filters",
    });

    // Current result actions
    if (currentResultId) {
      if (onVerifyCurrent) {
        items.push({
          id: "action-verify",
          type: "action",
          label: "Verify Current Result",
          description: "Verify the currently open result",
          icon: <CheckCircle className="w-4 h-4" />,
          shortcut: "V",
          action: () => {
            onVerifyCurrent();
            onClose();
          },
          category: "Current Result",
        });
      }

      if (onApproveCurrent) {
        items.push({
          id: "action-approve",
          type: "action",
          label: "Approve Current Result",
          description: "Approve the currently open result",
          icon: <CheckCircle className="w-4 h-4" />,
          shortcut: "A",
          action: () => {
            onApproveCurrent();
            onClose();
          },
          category: "Current Result",
        });
      }
    }

    // Result search
    results.slice(0, 10).forEach((result) => {
      items.push({
        id: `result-${result.id}`,
        type: "result",
        label: formatPatientFullName(result.order?.patient),
        description: `${result.test?.testName} - ${result.order?.orderNumber}`,
        icon: <Users className="w-4 h-4" />,
        result,
        action: () => {
          onNavigateToResult?.(result.id);
          onClose();
        },
        category: "Results",
      });
    });

    return items;
  }, [results, currentResultId, onNavigateToResult, onFilterByStatus, onVerifyCurrent, onApproveCurrent, onRefresh, onExport, onClearFilters, onClose]);

  const commandItems = buildCommandItems();

  // Filter items based on search query
  const filteredItems = commandItems.filter(item => {
    const query = searchQuery.toLowerCase();
    const searchableResult = item.result
      ? [
          item.result.order?.patient?.uhid,
          item.result.order?.barcode,
          item.result.status,
          ...(item.result.values || []).map((value: any) => value.parameter?.parameterName),
        ].filter(Boolean).join(" ").toLowerCase()
      : "";
    return (
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      searchableResult.includes(query)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const selectedItem = filteredItems[selectedIndex];
  const selectedResult = selectedItem?.result;
  const selectedFlags = selectedResult?.values?.filter(
    (value: any) => value.flag === "CRITICAL" || value.flag === "HIGH" || value.flag === "LOW"
  ) || [];
  const selectedValues = selectedResult?.values?.slice(0, 6) || [];
  const formatResultDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "Not recorded";

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-4 text-white">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" /> Advanced command center
          </div>
          <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-slate-300" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search results, actions, or navigate..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 text-xs text-slate-300">
            <kbd className="rounded border border-white/20 px-2 py-1">ESC</kbd>
            <span>to close</span>
          </div>
          </div>
        </div>

        {/* Command List */}
        <div
          ref={listRef}
          className="max-h-[28rem] overflow-y-auto p-2"
        >
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {category}
              </div>
              {items.map((item, index) => {
                const globalIndex = filteredItems.indexOf(item);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 ${
                      isSelected ? "bg-cyan-50 ring-1 ring-cyan-200" : ""
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isSelected ? "text-cyan-700" : "text-slate-400"}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="truncate text-xs text-slate-500">
                          {item.description}
                        </div>
                      )}
                    </div>

                    {selectedResult && (
                      <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">Selected result preview</p>
                            <h3 className="mt-1 text-base font-semibold text-slate-900">
                              {formatPatientFullName(selectedResult.order?.patient)}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {selectedResult.test?.testName} · {selectedResult.order?.orderNumber}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              onNavigateToResult?.(selectedResult.id);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                          >
                            Open details <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">Status</p>
                            <p className="mt-1 text-xs font-semibold capitalize text-slate-800">{selectedResult.status?.toLowerCase() || "Unknown"}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">Patient ID</p>
                            <p className="mt-1 truncate text-xs font-semibold text-slate-800">{selectedResult.order?.patient?.uhid || "—"}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">Parameters</p>
                            <p className="mt-1 text-xs font-semibold text-slate-800">{selectedResult.values?.length || 0} recorded</p>
                          </div>
                          <div className={`rounded-lg border p-2.5 ${selectedFlags.length ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
                            <p className={`text-[10px] uppercase tracking-wide ${selectedFlags.length ? "text-red-600" : "text-emerald-600"}`}>Clinical flags</p>
                            <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${selectedFlags.length ? "text-red-700" : "text-emerald-700"}`}>
                              {selectedFlags.length ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              {selectedFlags.length ? `${selectedFlags.length} attention` : "Within range"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Created {formatResultDate(selectedResult.createdAt)}</span>
                          <span>Barcode: {selectedResult.order?.barcode || "—"}</span>
                          {selectedFlags.length > 0 && <span className="font-medium text-red-600">Review flagged parameters before sign-off</span>}
                        </div>
                        {selectedValues.length > 0 && (
                          <div className="mt-3 border-t border-slate-200 pt-3">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Parameter snapshot</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {selectedValues.map((value: any) => {
                                const flagged = value.flag === "CRITICAL" || value.flag === "HIGH" || value.flag === "LOW";
                                return (
                                  <div key={value.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${flagged ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
                                    <span className="truncate text-xs text-slate-600">{value.parameter?.parameterName || "Parameter"}</span>
                                    <span className={`ml-2 whitespace-nowrap text-xs font-semibold ${flagged ? "text-red-700" : "text-slate-900"}`}>
                                      {value.value || "Pending"} {value.parameter?.unit || ""}
                                      {flagged && <span className="ml-1 text-[10px]">({value.flag})</span>}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {(onEnterResult || onViewHistory || onPreviewReport) && (
                          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                            {onEnterResult && (
                              <button onClick={() => { onEnterResult(selectedResult.id); onClose(); }} className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100">
                                Enter / edit values
                              </button>
                            )}
                            {onViewHistory && (
                              <button onClick={() => { onViewHistory(selectedResult.id); onClose(); }} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                View audit history
                              </button>
                            )}
                            {onPreviewReport && (selectedResult.status === "APPROVED" || selectedResult.status === "PUBLISHED") && (
                              <button onClick={() => { onPreviewReport(selectedResult.id); onClose(); }} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-100">
                                Preview report
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {item.shortcut && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {item.shortcut.split(" ").map((key, i) => (
                          <kbd
                            key={i}
                            className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-600"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Search className="mx-auto mb-2 h-12 w-12 text-slate-300" />
              <p className="text-sm text-gray-500">No results found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↑↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↵</kbd>
              <span>to select</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Command className="w-4 h-4" />
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to manage command palette
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
};