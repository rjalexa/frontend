'use client'

import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface HighlightsDialogProps {
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

export function HighlightsDialog({ 
  isOpen, 
  onClose, 
  articleTitle,
  datePublished,
  slug 
}: HighlightsDialogProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    const fetchHighlights = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setConnectionError(null);
      
      console.log('Fetching highlights with params:', { datePublished, slug });
      
      try {
        // Validate required parameters
        if (!datePublished || !slug) {
          throw new Error('datePublished and slug are required to fetch highlights');
        }

        // Create article ID from date and slug
        const articleId = `${datePublished.slice(0, 10)}-${slug}`;
        console.log('Constructed articleId:', articleId);
        
        // Fetch highlights
        const response = await fetch(`/api/highlights?articleId=${encodeURIComponent(articleId)}`);
        const data = await response.json();
        
        console.log('API Response:', data);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Article Highlights</DialogTitle>
          </div>
          <DialogDescription>
            Key highlights from &quot;{articleTitle}&quot;
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="text-gray-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              Loading highlights...
            </div>
          ) : connectionError ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-md">
              <div className="font-medium mb-1">Error</div>
              <div className="text-sm">{connectionError}</div>
              <div className="mt-2 text-xs text-gray-500">
                Debug info: 
                <pre className="mt-1 bg-gray-100 p-2 rounded">
                  {JSON.stringify({ datePublished, slug }, null, 2)}
                </pre>
              </div>
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

        <DialogFooter className="sm:justify-start">
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Back to Articles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}