import React from 'react';
import Image from 'next/image';
import { Hash } from "lucide-react";
import type { BasePanelProps } from '@/types/panel';
import type { Article } from '@/types/article';

interface TopicsPanelProps extends BasePanelProps {
  article: Article;
}

export default function TopicsPanel({ isOpen, onClose, article }: TopicsPanelProps) {
  if (!isOpen) return null;

  const manifestoTopics = [article.articleTag, article.topics, article.tags]
    .filter(Boolean)
    .join(", ");
  const memaTopics =
    Array.isArray(article.mema_topics) && article.mema_topics.length > 0
      ? article.mema_topics.join(", ")
      : "";

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <Hash className="w-4 h-4" />
          <span>Argomenti</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close panel"
          >
            ✕
          </button>
          <Image
            src="/mema.svg"
            alt="MeMa Logo"
            width={64}
            height={24}
            className="ml-6"
          />
        </div>
      </div>
      
      <div className="p-4 pb-2">
        {!manifestoTopics && !memaTopics ? (
          <div className="text-gray-500 text-center py-4">
            Nessun argomento disponibile
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Metadati attuali</h4>
              <p className="text-gray-700">
                {manifestoTopics || "Nessun argomento disponibile"}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Argomenti MeMa</h4>
              <p className="text-gray-700">
                {memaTopics || "Nessun argomento disponibile"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}