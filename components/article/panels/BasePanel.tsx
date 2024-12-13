// components/article/panels/BasePanel.tsx
import React from 'react';
import { SlidePanel } from "@/components/ui/slide-panel";
import type { BasePanelProps } from './types';

interface PanelWrapperProps extends BasePanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

export const PanelWrapper = ({ isOpen, onClose, title, children }: PanelWrapperProps) => {
  return (
    <div className="prose max-w-none">
      <SlidePanel
        isOpen={isOpen}
        onClose={onClose}
        title={title}
      >
        {children}
      </SlidePanel>
    </div>
  );
};