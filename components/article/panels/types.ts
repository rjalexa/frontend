// components/article/panels/types.ts
export interface BasePanelProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export interface Article {
    articleTag?: string;
    topics?: string;
    tags?: string;
    mema_topics?: string[];
    headline?: string;
  }
  
  export interface Highlight {
    highlight_text: string;
    highlight_sequence_number: number;
  }