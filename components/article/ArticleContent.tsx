"use client";

import React from "react";
import { HighlightsPanel, TopicsPanel, SummaryPanel } from "./panels";
import { EntitiesPanel } from "@/components/entities/EntitiesPanel";
import MapPanel from "@/components/maps/MapPanel";
import type { Article } from "@/lib/types";

interface ArticleContentProps {
  article: Article;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  highlightsOpen: boolean;
  setHighlightsOpen: (open: boolean) => void;
  topicsOpen: boolean;
  setTopicsOpen: (open: boolean) => void;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
  entitiesOpen: boolean;
  setEntitiesOpen: (open: boolean) => void;
}

const ArticleContent = ({
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
}: ArticleContentProps) => {
  return (
    <div className="w-full px-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {article.headline || article.title}
        </h1>

        {article.articleKicker && (
          <div className="text-lg text-gray-600 mb-6">
            {article.articleKicker}
          </div>
        )}

        <div className="flex items-center justify-between text-lg text-gray-700">
          {article.author && (
            <div className="font-bold">By {article.author}</div>
          )}
          <time dateTime={article.datePublished || article.date_created}>
            {new Date(
              article.datePublished || article.date_created
            ).toLocaleDateString("it-IT", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </div>

      {/* Panels section */}
      <div className="space-y-4 mb-8">
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
          articleTitle={article.headline || article.title}
          highlights={article.highlights || []}
        />

        <MapPanel
          isOpen={mapOpen}
          onClose={() => setMapOpen(false)}
          article={article}
        />

        <EntitiesPanel
          isOpen={entitiesOpen}
          article={article}
        />
      </div>

      {/* Article body section */}
      <div id="article-body" className="prose max-w-none">
        <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
          {article.articleBody || article.content || (
            <div className="text-gray-500 italic">
              Article content not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleContent;
