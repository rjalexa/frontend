// components/statistics/ListCard.tsx
import React from "react";

import { IListItem } from "./types";

interface ListCardProps {
  title: string;
  items?: IListItem[];
  status: "loading" | "error" | "success" | undefined;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, status }) => (
  <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {status === "loading" ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="ml-auto h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : status === "error" ? (
          <span className="text-gray-500">Dati non disponibili</span>
        ) : (
          <div className="space-y-3">
            {items?.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors animate-fadeIn delay-${index * 150}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">
                    {index + 1}.
                  </span>
                  <span className="text-gray-700 font-medium truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-gray-500 tabular-nums">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ListCard;
