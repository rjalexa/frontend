// components/article/panels/HighlightsPanel.tsx
import React from 'react';
import { Highlighter } from "lucide-react";
import type { BasePanelProps } from './types';

interface Highlight {
  highlight_text: string;
  highlight_sequence_number: number;
}

interface HighlightsPanelProps extends BasePanelProps {
  articleTitle: string;
  highlights: Highlight[];
}

export default function HighlightsPanel({ 
  isOpen, 
  onClose, 
  articleTitle, 
  highlights 
}: HighlightsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <Highlighter className="w-4 h-4" />
          <span>Punti salienti</span>
        </div>
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6 ml-6" />
      </div>
      
      <div className="p-4">
        {highlights && highlights.length > 0 ? (
          <div className="space-y-4">
            <ul className="list-disc list-inside space-y-2">
              {highlights
                .sort((a, b) => a.highlight_sequence_number - b.highlight_sequence_number)
                .map((highlight, index) => (
                  <li key={index} className="text-gray-700">
                    {highlight.highlight_text}
                  </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            Nessun punto saliente disponibile
          </div>
        )}
      </div>
    </div>
  );
}