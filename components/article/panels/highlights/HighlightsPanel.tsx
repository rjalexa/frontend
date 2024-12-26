import React from 'react';
import { Highlighter } from "lucide-react";
import Image from 'next/image';
import type { BasePanelProps } from '@/types/panel';
import type { Highlight } from '@/types/article';

interface HighlightsPanelProps extends BasePanelProps {
  highlights: Highlight[];
  articleTitle?: string;
}

export default function HighlightsPanel({
  isOpen,
  onClose,
  highlights,
  articleTitle
}: HighlightsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <Highlighter className="w-4 h-4" />
          <span>Punti salienti{articleTitle ? `: ${articleTitle}` : ''}</span>
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
        {highlights.length > 0 ? (
          <div className="space-y-4">
            {highlights
              .sort((a, b) => a.highlight_sequence_number - b.highlight_sequence_number)
              .map((highlight, index) => (
                <div
                  key={`${highlight.highlight_sequence_number}-${index}`}
                  className="relative pl-8 text-gray-700"
                >
                  <span className="absolute left-0 text-blue-600 font-medium">
                    {highlight.highlight_sequence_number}.
                  </span>
                  {highlight.highlight_text}
                </div>
              ))}
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