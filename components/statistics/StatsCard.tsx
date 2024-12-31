// components/statistics/StatsCard.tsx
import React from "react";

import AnimatedCounter from "./AnimatedCounter";
import { IStatsCardProps } from "./types";

const StatsCard = ({
  title,
  value,
  isLoading,
  hasError,
  errorMessage,
}: IStatsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="h-8 flex items-center">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
            <span className="text-gray-500">Esecuzione query...</span>
          </div>
        ) : hasError ? (
          <span className="text-gray-500">Dati non disponibili</span>
        ) : (
          <div className="text-xl font-bold text-gray-900">
            {typeof value === "number" && <AnimatedCounter value={value} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;