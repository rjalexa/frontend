// components/article/panels/summary/SummaryPanel.tsx
import { FileText } from "lucide-react";
import Image from 'next/image';
import React from 'react';

import type { BasePanelProps } from '@/types/panel';

interface ISummaryPanelProps extends BasePanelProps {
  summary: string | null;
}

export default function SummaryPanel({ isOpen, onClose, summary }: ISummaryPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <FileText className="w-4 h-4" />
          <span>Sommario</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close panel"
          >
            ✕
          </button>
          <Image 
            src="/mema.svg" 
            alt="MeMa Logo" 
            width={64}
            height={24}
            className="ml-6" 
          />
        </div>
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