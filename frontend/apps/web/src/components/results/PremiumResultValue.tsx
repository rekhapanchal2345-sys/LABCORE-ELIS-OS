"use client";

import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PremiumResultValueProps {
  value: string;
  unit?: string;
  flag?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  size?: "sm" | "md" | "lg";
  showFlag?: boolean;
}

export const PremiumResultValue: React.FC<PremiumResultValueProps> = ({
  value,
  unit,
  flag,
  size = "md",
  showFlag = true,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-base";
      case "md":
        return "text-xl";
      case "lg":
        return "text-2xl";
      default:
        return "text-xl";
    }
  };

  const getFlagStyles = () => {
    switch (flag) {
      case "CRITICAL":
        return {
          valueClass: "text-red-600 font-bold",
          icon: <ArrowUp className="w-4 h-4 text-red-600" />,
          bgClass: "bg-red-50",
        };
      case "HIGH":
        return {
          valueClass: "text-orange-600 font-semibold",
          icon: <ArrowUp className="w-4 h-4 text-orange-600" />,
          bgClass: "bg-orange-50",
        };
      case "LOW":
        return {
          valueClass: "text-yellow-600 font-semibold",
          icon: <ArrowDown className="w-4 h-4 text-yellow-600" />,
          bgClass: "bg-yellow-50",
        };
      case "NORMAL":
      default:
        return {
          valueClass: "text-gray-900 font-medium",
          icon: null,
          bgClass: "bg-transparent",
        };
    }
  };

  const styles = getFlagStyles();

  return (
    <div className={`inline-flex items-baseline gap-1 ${styles.bgClass} rounded px-2 py-1`}>
      <span className={`${getSizeClasses()} ${styles.valueClass}`}>
        {value}
      </span>
      {unit && (
        <span className="text-xs text-gray-500 font-normal">
          {unit}
        </span>
      )}
      {showFlag && flag !== "NORMAL" && styles.icon && (
        <span className="ml-1">{styles.icon}</span>
      )}
    </div>
  );
};