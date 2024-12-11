import React, { useState, useEffect } from 'react';
import { SlidePanel } from "../ui/slide-panel";

interface HighlightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
  datePublished?: string;
  slug?: string;
}

interface Highlight {
  highlight_text: string;
  highlight_sequence_number: number;
  highlight_type: string;
  highlight_article_author: string;
  highlight_article_date: string;
  highlight_article_mema_id: string;
}

export function HighlightsPanel({ 
  isOpen, 
  onClose, 
  articleTitle,
  datePublished,
  slug 
}: HighlightsPanelProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    const fetchHighlights = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setConnectionError(null);
      
      try {
        if (!datePublished || !slug) {
          throw new Error('datePublished and slug are required to fetch highlights');
        }

        const articleId = `${datePublished.slice(0, 10)}-${slug}`;
        const response = await fetch(`/api/highlights?articleId=${encodeURIComponent(articleId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch highlights');
        }

        setHighlights(data.highlights || []);
      } catch (error) {
        console.error('Highlights fetch error:', error);
        setConnectionError(
          error instanceof Error 
            ? `Error: ${error.message}` 
            : 'Failed to fetch highlights'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, [isOpen, datePublished, slug]);

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Article Highlights"
    >
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          Key highlights from &quot;{articleTitle}&quot;
        </p>
        
        {isLoading ? (
          <div className="text-gray-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            Loading highlights...
          </div>
        ) : connectionError ? (
          <div className="text-red-600 p-4 bg-red-50 rounded-md">
            <div className="font-medium mb-1">Error</div>
            <div className="text-sm">{connectionError}</div>
          </div>
        ) : highlights.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No highlights found for this article.
          </div>
        ) : (
          <ul className="space-y-3">
            {highlights.map((highlight, index) => (
              <li 
                key={`${highlight.highlight_sequence_number || index}`}
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