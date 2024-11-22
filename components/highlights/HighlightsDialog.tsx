// frontend/components/highlights/HighlightsDialog.tsx
'use client'

import React from 'react';
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