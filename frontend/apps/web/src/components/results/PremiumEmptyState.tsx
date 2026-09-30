"use client";

import React from "react";
import { FileText, Search, AlertCircle, CheckCircle, Users } from "lucide-react";

interface EmptyStateProps {
  type: "no-results" | "no-search-results" | "no-pending" | "no-data";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const PremiumEmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
}) => {
  const getConfig = () => {
    switch (type) {
      case "no-results":
        return {
          icon: <FileText className="w-16 h-16 text-gray-300" />,
          defaultTitle: "No Results Found",
          defaultDescription: "There are no results to display. Results will appear here once tests are completed.",
        };
      case "no-search-results":
        return {
          icon: <Search className="w-16 h-16 text-gray-300" />,
          defaultTitle: "No Search Results",
          defaultDescription: "We couldn't find any results matching your search criteria. Try adjusting your filters.",
        };
      case "no-pending":
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-300" />,
          defaultTitle: "All Caught Up!",
          defaultDescription: "There are no pending results requiring your attention. Great job!",
        };
      case "no-data":
        return {
          icon: <AlertCircle className="w-16 h-16 text-gray-300" />,
          defaultTitle: "No Data Available",
          defaultDescription: "No data is currently available for this view.",
        };
      default:
        return {
          icon: <Users className="w-16 h-16 text-gray-300" />,
          defaultTitle: "No Data",
          defaultDescription: "No data available",
        };
    }
  };

  const config = getConfig();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          {description || config.defaultDescription}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};