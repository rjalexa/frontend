// components/ui/slide/index.tsx
import * as React from "react"
import { X } from "lucide-react"
import { cn } from '@/lib/utils/components';

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: React.ReactNode
  titleClassName?: string
}

export function SlidePanel({ 
  isOpen, 
  onClose, 
  children, 
  title,
  titleClassName 
}: SlidePanelProps) {
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      const articleBody = document.getElementById('article-body');
      if (articleBody) {
        const rect = articleBody.getBoundingClientRect();
        const panel = document.getElementById('highlights-panel');
        if (panel) {
          panel.style.top = `${rect.top}px`;
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Panel */}
      <div
        id="highlights-panel"
        className={cn(
          "fixed w-[600px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 rounded-lg",
          "left-20"
        )}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            {title && (
              <h2 className={cn("text-lg font-semibold", titleClassName)}>{title}</h2>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-[200px] pb-3">
            {children}
          </div>
        </div>
      </div>
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  )
}