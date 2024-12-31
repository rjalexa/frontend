// components/statistics/ListStatsCard.tsx
import React, { useEffect, useState } from "react";

import { IListStatsCardProps } from "./types";

const ListStatsCard = ({
  title,
  items,
  isLoading,
  hasError,
  errorMessage,
}: IListStatsCardProps) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    if (items && items.length > 0) {
      setVisibleItems([]);
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => [...prev, index]);
        }, index * 100);
      });
    }
  }, [items]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
            <span className="text-gray-500">Esecuzione query...</span>
          </div>
        ) : hasError ? (
          <span className="text-gray-500">Dati non disponibili</span>
        ) : items && items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={item.label}
              className={`flex justify-between items-center py-1 transition-all duration-300 ${
                visibleItems.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-gray-600 truncate flex-1 pr-4">
                {item.label}
              </span>
              <span className="text-gray-900 font-medium">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <span className="text-gray-500">Nessun dato disponibile</span>
        )}
      </div>
    </div>
  );
};

export default ListStatsCard;