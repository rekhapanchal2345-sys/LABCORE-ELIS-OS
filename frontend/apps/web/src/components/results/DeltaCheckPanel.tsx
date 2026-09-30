"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react";

interface DeltaCheckData {
  currentValue: number;
  previousValue: number;
  deltaPercentage: number;
  deltaAbsolute: number;
  isSignificant: boolean;
  threshold?: number;
}

interface DeltaCheckPanelProps {
  currentValue: string;
  previousValue?: string;
  threshold?: number;
  unit?: string;
  onWarningAcknowledged?: () => void;
}

export const DeltaCheckPanel: React.FC<DeltaCheckPanelProps> = ({
  currentValue,
  previousValue,
  threshold = 20, // Default 20% threshold
  unit,
  onWarningAcknowledged,
}) => {
  const [deltaData, setDeltaData] = useState<DeltaCheckData | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!currentValue || !previousValue) {
      setDeltaData(null);
      return;
    }

    const current = parseFloat(currentValue);
    const previous = parseFloat(previousValue);

    if (isNaN(current) || isNaN(previous) || previous === 0) {
      setDeltaData(null);
      return;
    }

    const deltaAbsolute = current - previous;
    const deltaPercentage = (deltaAbsolute / previous) * 100;
    const isSignificant = Math.abs(deltaPercentage) >= threshold;

    setDeltaData({
      currentValue: current,
      previousValue: previous,
      deltaPercentage,
      deltaAbsolute,
      isSignificant,
      threshold,
    });
  }, [currentValue, previousValue, threshold]);

  const handleAcknowledge = () => {
    setAcknowledged(true);
    onWarningAcknowledged?.();
  };

  if (!deltaData) {
    return null;
  }

  const { deltaPercentage, deltaAbsolute, isSignificant } = deltaData;
  const isIncrease = deltaPercentage > 0;

  return (
    <div
      className={`mt-2 p-3 rounded-lg border ${
        isSignificant && !acknowledged
          ? "bg-amber-50 border-amber-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isSignificant && !acknowledged ? (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          ) : (
            <Info className="w-5 h-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              Delta vs Previous Result
            </span>
            {isIncrease ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-lg font-semibold ${
                isIncrease ? "text-green-600" : "text-red-600"
              }`}
            >
              {isIncrease ? "+" : ""}
              {deltaPercentage.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">
              ({isIncrease ? "+" : ""}
              {deltaAbsolute.toFixed(2)} {unit})
            </span>
          </div>

          {isSignificant && !acknowledged && (
            <div className="mt-2">
              <p className="text-xs text-amber-700">
                Significant change detected (threshold: {threshold}%). Please verify
                this result before proceeding.
              </p>
              <button
                onClick={handleAcknowledge}
                className="mt-2 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200"
              >
                Acknowledge Warning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TrendDataPoint {
  date: string;
  value: number;
  status?: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
}

interface MiniTrendChartProps {
  data: TrendDataPoint[];
  unit?: string;
  referenceRange?: {
    min: number;
    max: number;
  };
}

export const MiniTrendChart: React.FC<MiniTrendChartProps> = ({
  data,
  unit,
  referenceRange,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
        No trend data available
      </div>
    );
  }

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // SVG dimensions
  const width = 200;
  const height = 60;
  const padding = 5;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const normalizedValue = (d.value - minValue) / range;
    const y = height - padding - normalizedValue * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  // Calculate reference range line positions
  const refMinY = referenceRange
    ? height - padding - ((referenceRange.min - minValue) / range) * (height - 2 * padding)
    : null;
  const refMaxY = referenceRange
    ? height - padding - ((referenceRange.max - minValue) / range) * (height - 2 * padding)
    : null;

  return (
    <div className="relative">
      <svg width={width} height={height} className="w-full">
        {/* Reference range band */}
        {referenceRange && refMinY !== null && refMaxY !== null && (
          <rect
            x={padding}
            y={Math.min(refMinY, refMaxY)}
            width={width - 2 * padding}
            height={Math.abs(refMaxY - refMinY)}
            fill="rgba(16, 185, 129, 0.1)"
            rx="2"
          />
        )}

        {/* Trend line */}
        <polyline
          points={points}
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
          const normalizedValue = (d.value - minValue) / range;
          const y = height - padding - normalizedValue * (height - 2 * padding);
          
          let pointColor = "#0284c7";
          if (d.status === "CRITICAL") pointColor = "#dc2626";
          else if (d.status === "HIGH") pointColor = "#f97316";
          else if (d.status === "LOW") pointColor = "#eab308";

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={pointColor}
              className="hover:r-4 transition-all cursor-pointer"
            />
          );
        })}
      </svg>

      {/* Tooltip could be added here for interactive hover */}
    </div>
  );
};