"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, PenTool, Check } from "lucide-react";
import { reportsApi } from "@/lib/api";

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onSuccess: () => void;
}

export default function DigitalSignatureModal({
  isOpen,
  onClose,
  reportId,
  onSuccess,
}: DigitalSignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setHasSignature(true);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) {
        setError("Please provide a signature");
        setLoading(false);
        return;
      }

      const signatureData = canvas.toDataURL("image/png");
      await reportsApi.applyDigitalSignature(reportId, signatureData);
      
      clearSignature();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to apply signature");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm premium-modal-backdrop">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl premium-modal-content premium-glass">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-cyan-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Apply Digital Signature
              </h3>
              <p className="text-sm text-gray-600">
                Sign to authorize this report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Signature
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="w-full h-48 bg-white rounded cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">
                Draw your signature in the box above
              </span>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Signature
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasSignature}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "Applying..." : (
                <>
                  <Check className="h-4 w-4" />
                  Apply Signature
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}