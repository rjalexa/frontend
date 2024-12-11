import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

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
  title 
}: SlidePanelProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="h-full flex flex-col">
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
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
    </div>
  )
}
