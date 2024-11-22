// frontend/components/highlights/HighlightsDialog.tsx
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
import { X } from "lucide-react";

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
      if (isOpen) {
        setIsLoading(true);
        setConnectionError(null);
        
        try {
          // Check DB connection first
          const healthResponse = await fetch('/api/weaviate-health');
          if (!healthResponse.ok) {
            const data = await healthResponse.json();
            throw new Error(data.error || 'Failed to connect to the database');
          }

          // Create article ID from date and slug
          if (!datePublished || !slug) {
            throw new Error('datePublished and slug are required to fetch highlights');
          }
          const articleId = `${datePublished.slice(0, 10)}-${slug}`;
          
          // Fetch highlights
          const response = await fetch(`/api/highlights?articleId=${encodeURIComponent(articleId)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch highlights');
          }

          const data = await response.json();
          setHighlights(data.highlights || []);
        } catch (error) {
          setConnectionError(
            error instanceof Error 
              ? `Error: ${error.message}` 
              : 'Failed to fetch highlights'
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHighlights();
  }, [isOpen, datePublished, slug]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
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
                <div className="text-xs text-gray-500 mt-2">
                  Please try again later.
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
                    key={highlight.highlight_sequence_number}
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
            <DialogPrimitive.Close asChild>
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto"
              >
                Back to Articles
              </Button>
            </DialogPrimitive.Close>
          </DialogFooter>
        </DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}