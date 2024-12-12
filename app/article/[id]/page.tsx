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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { HighlightsPanel } from "@/components/highlights/HighlightsPanel";
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

const ArticleContent = ({ article }: { article: Article }) => {
  return (
    <div className="prose max-w-none">
      {/* Header section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {article.headline}
        </h1>

        {article.articleKicker && (
          <div className="text-lg text-gray-600 mb-6">{article.articleKicker}</div>
        )}
        
        <div className="flex items-center justify-between text-lg text-gray-700">
          {article.author && (
            <div className="font-bold">
              By {article.author}
            </div>
          )}
          {article.datePublished && (
            <time dateTime={article.datePublished}>
              {new Date(article.datePublished).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          )}
        </div>
      </div>

      {/* Article body section with positioning context */}
      <div id="article-body" className="relative">
        <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
          {article.articleBody || (
            <div className="text-gray-500 italic">Article content not available</div>
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
  const [activeView, setActiveView] = useState<"article" | "entities">("article");
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
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
        if (highlightsOpen) {
          // If the highlights panel is open, let its own handler close it
          return;
        }

        // If we're currently viewing entities, pressing ESC goes back to the article view
        if (activeView === "entities") {
          setActiveView("article");
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [highlightsOpen, activeView]);

  if (loading) return <div className="p-4 text-gray-900">Loading...</div>;
  if (!article)
    return <div className="p-4 text-gray-900">Article not found</div>;

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
          {activeView !== "entities" && (
            <button
              onClick={() => {
                if (highlightsOpen) {
                  setHighlightsOpen(false);
                  setSelectedArticle(null);
                } else {
                  setSelectedArticle(article);
                  setHighlightsOpen(true);
                }
              }}
              className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
                highlightsOpen
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <Highlighter className="w-4 h-4" />
              Punti salienti
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="relative mt-6 prose mx-auto">
          {activeView === "entities" ? (
            <EntitiesView article={article} />
          ) : (
            <>
              <ArticleContent article={article} />
              {selectedArticle && (
                <HighlightsPanel
                  isOpen={highlightsOpen}
                  onClose={() => {
                    setHighlightsOpen(false);
                    setSelectedArticle(null);
                  }}
                  articleTitle={selectedArticle.headline}
                  highlights={selectedArticle.highlights || []}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}