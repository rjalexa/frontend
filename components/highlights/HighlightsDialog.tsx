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
}

const mockHighlights = [
  "La dolce vita - The sweet life",
  "Ciao bella! - Hello beautiful!",
  "Al dente - To the tooth (perfectly cooked pasta)",
  "Bellissimo - Very beautiful",
  "Tutti frutti - All fruits (meaning 'all together')"
];

export function HighlightsDialog({ isOpen, onClose, articleTitle }: HighlightsDialogProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      if (isOpen) {
        setIsChecking(true);
        setConnectionError(null);
        
        try {
          const response = await fetch('/api/weaviate-health');
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to connect to the database');
          }
        } catch (error) {
          setConnectionError(
            error instanceof Error 
              ? `Database connection error: ${error.message}` 
              : 'Failed to connect to the database'
          );
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkConnection();
  }, [isOpen]);

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
            {isChecking ? (
              <div className="text-gray-600 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Checking database connection...
              </div>
            ) : connectionError ? (
              <div className="text-red-600 p-4 bg-red-50 rounded-md">
                <div className="font-medium mb-1">Connection Error</div>
                <div className="text-sm">{connectionError}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Please ensure Weaviate is running and accessible.
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {mockHighlights.map((highlight, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{highlight}</span>
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