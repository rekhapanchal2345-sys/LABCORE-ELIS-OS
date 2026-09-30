"use client";

import React from "react";
import { CheckCircle, AlertCircle, Clock, FileText, AlertTriangle } from "lucide-react";

interface PremiumStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const PremiumStatusBadge: React.FC<PremiumStatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    
    switch (normalizedStatus) {
      case "approved":
      case "published":
        return {
          icon: CheckCircle,
          label: status,
          bgColor: "bg-gradient-to-r from-emerald-50 to-teal-50",
          textColor: "text-emerald-800",
          borderColor: "border-emerald-200",
          iconColor: "text-emerald-600",
        };
      case "verified":
        return {
          icon: CheckCircle,
          label: status,
          bgColor: "bg-gradient-to-r from-cyan-50 to-indigo-50",
          textColor: "text-indigo-800",
          borderColor: "border-indigo-200",
          iconColor: "text-cyan-600",
        };
      case "entered":
        return {
          icon: FileText,
          label: status,
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
        };
      case "pending":
        return {
          icon: Clock,
          label: status,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          iconColor: "text-gray-500",
        };
      case "critical":
        return {
          icon: AlertTriangle,
          label: status,
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
        };
      default:
        return {
          icon: AlertCircle,
          label: status,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          iconColor: "text-gray-500",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span className="font-medium capitalize">{config.label}</span>
    </div>
  );
};

interface ResultFlagBadgeProps {
  flag?: string;
  size?: "sm" | "md" | "lg";
}

export const ResultFlagBadge: React.FC<ResultFlagBadgeProps> = ({
  flag,
  size = "md",
}) => {
  if (!flag || flag === "NORMAL") {
    return null;
  }

  const getFlagConfig = (flag: string) => {
    switch (flag) {
      case "CRITICAL":
        return {
          icon: AlertTriangle,
          label: "Critical",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
        };
      case "HIGH":
        return {
          icon: AlertCircle,
          label: "High",
          bgColor: "bg-orange-50",
          textColor: "text-orange-700",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
        };
      case "LOW":
        return {
          icon: AlertCircle,
          label: "Low",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
        };
      default:
        return null;
    }
  };

  const config = getFlagConfig(flag);
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      <span className="font-medium">{config.label}</span>
    </div>
  );
};