// components/article/panels/types.ts
export interface IBasePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface IHighlight {
  highlight_text: string;
  highlight_sequence_number: number;
}
