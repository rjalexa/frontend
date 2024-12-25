export interface BasePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Highlight {
  highlight_text: string;
  highlight_sequence_number: number;
}
