// components/statistics/MetricCard.tsx
import React from "react";

import AnimatedCounter from "./AnimatedCounter";

interface MetricCardProps {
  title: string;
  value: number | undefined;
  status: "loading" | "error" | "success" | undefined;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, status }) => (
  <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
    <div className="px-6 py-8">
      <div className="font-medium text-gray-500 uppercase tracking-wide text-sm">
        {title}
      </div>
      <div className="mt-3 flex items-center">
        {status === "loading" || value === undefined ? (
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded" />
        ) : status === "error" ? (
          <span className="text-gray-500">Dati non disponibili</span>
        ) : (
          <div className="text-3xl font-bold text-gray-900">
            <AnimatedCounter value={value} />
          </div>
        )}
      </div>
    </div>
  </div>
);

export default MetricCard;
