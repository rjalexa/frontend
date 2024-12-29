import React from "react";

import type { Article } from "@/types/article";

import {
  HighlightsPanel,
  TopicsPanel,
  SummaryPanel,
  MapPanel,
  EntitiesPanel,
} from "../panels";

interface IArticleContentProps {
  article: Article;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  highlightsOpen: boolean;
  setHighlightsOpen: (open: boolean) => void;
  topicsOpen: boolean;
  setTopicsOpen: (open: boolean) => void;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
  setDesiredMapState?: (state: boolean) => void;
  entitiesOpen: boolean;
  setEntitiesOpen: (open: boolean) => void;
}

const ArticleContent: React.FC<IArticleContentProps> = ({
  article,
  summaryOpen,
  setSummaryOpen,
  highlightsOpen,
  setHighlightsOpen,
  topicsOpen,
  setTopicsOpen,
  mapOpen,
  setMapOpen,
  entitiesOpen,
  setEntitiesOpen,
  setDesiredMapState,
}) => {
  // Safe map close handler that checks if setDesiredMapState exists
  const handleMapClose = () => {
    setMapOpen(false);
    if (setDesiredMapState) {
      setDesiredMapState(false);
    }
  };

  return (
    <div>
      <TopicsPanel
        isOpen={topicsOpen}
        onClose={() => setTopicsOpen(false)}
        article={article}
      />

      <SummaryPanel
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        summary={article.mema_summary || null}
      />

      <HighlightsPanel
        isOpen={highlightsOpen}
        onClose={() => setHighlightsOpen(false)}
        highlights={article.highlights || []}
      />

      <MapPanel
        isOpen={mapOpen}
        onClose={handleMapClose}
        article={article}
        setDesiredMapState={setDesiredMapState}
      />

      <EntitiesPanel
        isOpen={entitiesOpen}
        onClose={() => setEntitiesOpen(false)}
        article={article}
      />

      {/* Article content rendering with proper structure */}
      <div className="w-full">
        {/* Title */}
        <h1 className="text-4xl font-extrabold mb-4 text-left">
          {article.title}
        </h1>

        {/* Author and date line */}
        <div className="flex justify-between items-center mb-4 text-lg">
          <div className="font-bold">{article.author}</div>
          <div className="mr-8">
            {new Date(article.datePublished)
              .toLocaleDateString("it-IT", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              .replace(
                /^(\d+)\s([a-z]+)\s(\d+)$/i,
                (_, d, m, y) =>
                  `${d} ${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`,
              )}
          </div>
        </div>

        {/* Kicker when present */}
        {article.articleKicker && (
          <div className="text-lg font-medium mb-6">
            {article.articleKicker}
          </div>
        )}

        {/* Article body */}
        <div className="prose max-w-none">
          {article.articleBody || article.content}
        </div>
      </div>
    </div>
  );
};

export default ArticleContent;
