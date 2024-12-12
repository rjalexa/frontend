// components/highlights/HighlightsPanel.tsx
import React from 'react';
import { SlidePanel } from "@/components/ui/slide-panel";
import { Highlighter } from "lucide-react";

interface HighlightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
  highlights: Array<{
    highlight_text: string;
    highlight_sequence_number: number;
  }>;
}

export function HighlightsPanel({ 
  isOpen, 
  onClose, 
  articleTitle,
  highlights = []
}: HighlightsPanelProps) {
  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Highlighter className="w-4 h-4" />
          <span>Punti Salienti</span>
        </div>
      }
      titleClassName="text-green-700 bg-green-100 px-4 py-2 rounded-md flex items-center"
    >
      <div className="p-4">
        {highlights.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No highlights found for this article.
          </div>
        ) : (
          <ul className="space-y-3">
            {highlights.map((highlight, index) => (
              <li 
                key={highlight.highlight_sequence_number || index}
                className="flex items-start gap-2"
              >
                <span className="text-blue-600 font-bold">•</span>
                <span>{highlight.highlight_text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SlidePanel>
  );
}