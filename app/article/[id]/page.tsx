"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Highlighter,
  MapPin,
  User,
  Building,
  Search,
  Microscope,
  FileText,
  Hash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EntitiesView from "./EntitiesView";

interface Article {
  id: string;
  headline: string;
  author?: string;
  datePublished?: string;
  kicker?: string;
  body?: string;
  meta_data?: Entity[];
  slug?: string;
  articleKicker?: string;
  articleBody?: string;
  articleTag?: string;
  topics?: string;
  tags?: string;
  mema_summary?: string;
  mema_topics?: string;
  highlights?: Array<{
    highlight_text: string;
    highlight_sequence_number: number;
  }>;
}

interface Entity {
  id: string;
  kind: "person" | "location" | "organization";
  label: string;
  summary?: string;
  coordinates?: string;
  linking_info?: LinkingInfo[];
}

interface LinkingInfo {
  source: string;
  url: string;
  title: string;
  summary: string;
  timestamp: string;
  geoid?: number;
  lat?: number;
  lng?: number;
  country_name?: string;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

const TopicsPanel = ({
  isOpen,
  onClose,
  article,
}: {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
}) => {
  const manifestoTopics = [article.articleTag, article.topics, article.tags]
    .filter(Boolean)
    .join(", ");
  const memaTopics = article.mema_topics || "";

  if (!isOpen) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8 relative transform transition-all duration-300 ease-in-out">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
      <div className="flex items-start gap-4">
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Argomenti</h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Argomenti Manifesto: </span>
              {manifestoTopics || "Nessun argomento disponibile"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Argomenti MeMa: </span>
              {memaTopics || "Nessun argomento disponibile"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HighlightsPanel = ({
  isOpen,
  onClose,
  articleTitle,
  highlights,
}: {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
  highlights: Array<{
    highlight_text: string;
    highlight_sequence_number: number;
  }>;
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8 relative transition-all duration-300 ease-in-out">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
      <div className="flex items-start gap-4">
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">Punti salienti</h3>
          <div className="space-y-3">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-blue-600 font-medium">{index + 1}.</span>
                <p className="text-gray-700">{highlight.highlight_text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryPanel = ({
  isOpen,
  onClose,
  summary,
}: {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8 relative transform transition-all duration-300 ease-in-out">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
      <div className="flex items-start gap-4">
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Sommario MeMa</h3>
          <p className="text-gray-700">{summary}</p>
        </div>
      </div>
    </div>
  );
};

const ArticleContent = ({
  article,
  summaryOpen,
  setSummaryOpen,
  highlightsOpen,
  setHighlightsOpen,
  topicsOpen,
  setTopicsOpen,
}: {
  article: Article;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  highlightsOpen: boolean;
  setHighlightsOpen: (open: boolean) => void;
  topicsOpen: boolean;
  setTopicsOpen: (open: boolean) => void;
}) => {
  return (
    <div className="prose max-w-none">
      {/* Header section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {article.headline}
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
          {article.datePublished && (
            <time dateTime={article.datePublished}>
              {new Date(article.datePublished).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </div>
      </div>

      {/* Summary, Highlights, and Topics Panels */}
      {article.mema_summary && (
        <SummaryPanel
          isOpen={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          summary={article.mema_summary}
        />
      )}
      <TopicsPanel
        isOpen={topicsOpen}
        onClose={() => setTopicsOpen(false)}
        article={article}
      />
      {article.highlights && article.highlights.length > 0 && (
        <HighlightsPanel
          isOpen={highlightsOpen}
          onClose={() => setHighlightsOpen(false)}
          articleTitle={article.headline}
          highlights={article.highlights}
        />
      )}

      {/* Article body section with positioning context */}
      <div id="article-body" className="relative">
        <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
          {article.articleBody || (
            <div className="text-gray-500 italic">
              Article content not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"article" | "entities">(
    "article"
  );
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const resolvedParams = React.use(params);
  const articleId = resolvedParams.id;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch("/api/files");
        const articles: Article[] = await response.json();
        const found = articles.find((a: Article) => a.id === articleId);
        if (found) {
          console.log("Fetched article:", found);
          setArticle(found);
        } else {
          setArticle(null);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        // Close panels if they're open
        if (highlightsOpen) {
          setHighlightsOpen(false);
        }
        if (summaryOpen) {
          setSummaryOpen(false);
        }
        if (topicsOpen) {
          setTopicsOpen(false);
        }
        // If no panels are open and we're in entities view, go back to article view
        if (
          !highlightsOpen &&
          !summaryOpen &&
          !topicsOpen &&
          activeView === "entities"
        ) {
          setActiveView("article");
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [highlightsOpen, activeView, summaryOpen, topicsOpen]);

  if (loading) return <div className="p-4 text-gray-900">Loading...</div>;
  if (!article)
    return <div className="p-4 text-gray-900">Article not found</div>;

  console.log("Debug: Rendering buttons, activeView =", activeView); // Debug log

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() =>
            router.push(
              "/?sortField=" +
                localStorage.getItem("sortField") +
                "&sortDirection=" +
                localStorage.getItem("sortDirection")
            )
          }
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </button>

        {/* Top row of buttons */}
        <div className="flex items-center gap-4 mb-8">
          <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6" />
          <button
            onClick={() =>
              setActiveView(activeView === "entities" ? "article" : "entities")
            }
            className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
              activeView === "entities"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            <Microscope className="w-4 h-4" />
            Entità e dettagli
          </button>

          {/* Group all non-entities buttons together */}
          {activeView !== "entities" && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setHighlightsOpen(!highlightsOpen)}
                className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
                  highlightsOpen
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <Highlighter className="w-4 h-4" />
                Punti salienti
              </button>

              <button
                onClick={() => setSummaryOpen(!summaryOpen)}
                className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
                  summaryOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                Sommario
              </button>

              <button
                onClick={() => setTopicsOpen(!topicsOpen)}
                className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
                  topicsOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <Hash className="w-4 h-4" />
                Argomenti
              </button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="relative mt-6 prose mx-auto">
          {activeView === "entities" ? (
            <EntitiesView article={article} />
          ) : (
            <ArticleContent
              article={article}
              summaryOpen={summaryOpen}
              setSummaryOpen={setSummaryOpen}
              highlightsOpen={highlightsOpen}
              setHighlightsOpen={setHighlightsOpen}
              topicsOpen={topicsOpen}
              setTopicsOpen={setTopicsOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
}