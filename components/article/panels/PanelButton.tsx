// components/article/panels/PanelButton.tsx
import { LucideIcon } from 'lucide-react';

interface PanelButtonProps {
  isOpen: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

export const PanelButton = ({ isOpen, onClick, icon: Icon, label }: PanelButtonProps) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
      isOpen
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);