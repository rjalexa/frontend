// components/article/panels/SummaryPanel.tsx
import React from 'react';
import { FileText } from "lucide-react";
import type { BasePanelProps } from './types';

interface SummaryPanelProps extends BasePanelProps {
  summary: string | null;
}

export default function SummaryPanel({ isOpen, onClose, summary }: SummaryPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <FileText className="w-4 h-4" />
          <span>Sommario</span>
        </div>
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6 ml-6" />
      </div>
      
      <div className="p-4">
        {summary ? (
          <div className="text-gray-700 whitespace-pre-wrap">
            {summary}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            Nessun sommario disponibile
          </div>
        )}
      </div>
    </div>
  );
}