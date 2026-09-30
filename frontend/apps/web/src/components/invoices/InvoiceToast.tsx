"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function InvoiceToast({ type, message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "info":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getStyles()}`}
    >
      {getIcon()}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 rounded-full p-1 hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast manager component
export function ToastManager() {
  const [toasts, setToasts] = useState<Array<{ id: string; type: "success" | "error" | "info"; message: string }>>([]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose addToast function globally
  useEffect(() => {
    (window as any).showInvoiceToast = addToast;
    return () => {
      delete (window as any).showInvoiceToast;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <InvoiceToast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Convenience function to show toasts
export function showInvoiceToast(type: "success" | "error" | "info", message: string) {
  if (typeof window !== "undefined" && (window as any).showInvoiceToast) {
    (window as any).showInvoiceToast(type, message);
  }
}