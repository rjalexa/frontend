"use client";

import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Microscope,
  Highlighter,
  FileText,
  Hash,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import ArticleContent from "@/components/article/content/ArticleContent";
import type { Article, SortField, SortDirection } from "@/types/article";

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [sortField, setSortField] = useState<SortField>("date_created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Panel states initialized to false by default
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [entitiesOpen, setEntitiesOpen] = useState(false);
  const [desiredMapState, setDesiredMapState] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Initialize states from localStorage after mount
  useEffect(() => {
    setHighlightsOpen(localStorage.getItem("highlightsOpen") === "true");
    setSummaryOpen(localStorage.getItem("summaryOpen") === "true");
    setTopicsOpen(localStorage.getItem("topicsOpen") === "true");
    setEntitiesOpen(localStorage.getItem("entitiesOpen") === "true");
    setDesiredMapState(localStorage.getItem("desiredMapState") === "true");

    const savedSortField = localStorage.getItem("sortField") as SortField;
    const savedSortDirection = localStorage.getItem(
      "sortDirection",
    ) as SortDirection;

    if (savedSortField) {
      setSortField(savedSortField);
    }
    if (savedSortDirection) {
      setSortDirection(savedSortDirection);
    }
  }, []);

  // Persist panel states to localStorage
  useEffect(() => {
    localStorage.setItem("highlightsOpen", String(highlightsOpen));
  }, [highlightsOpen]);

  useEffect(() => {
    localStorage.setItem("summaryOpen", String(summaryOpen));
  }, [summaryOpen]);

  useEffect(() => {
    localStorage.setItem("topicsOpen", String(topicsOpen));
  }, [topicsOpen]);

  useEffect(() => {
    localStorage.setItem("entitiesOpen", String(entitiesOpen));
  }, [entitiesOpen]);

  useEffect(() => {
    localStorage.setItem("desiredMapState", String(desiredMapState));
  }, [desiredMapState]);

  const resolvedParams = React.use(params);
  const articleId = resolvedParams.id;

  // Save current article ID for navigation
  useEffect(() => {
    localStorage.setItem("lastViewedArticle", articleId);
  }, [articleId]);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/files");
        let articles: Article[] = await response.json();

        // Sort based on sortField/sortDirection
        articles = [...articles].sort((a, b) => {
          const direction = sortDirection === "asc" ? 1 : -1;
          if (sortField === "date_created") {
            return (
              direction *
              (new Date(a.date_created).getTime() -
                new Date(b.date_created).getTime())
            );
          }
          const aValue = (a[sortField] || "").toLowerCase();
          const bValue = (b[sortField] || "").toLowerCase();
          return direction * aValue.localeCompare(bValue);
        });

        setAllArticles(articles);
        const index = articles.findIndex((a) => a.id === articleId);
        setCurrentIndex(index);
        setArticle(index !== -1 ? articles[index] : null);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [articleId, sortField, sortDirection]);

  // Handle map visibility based on article locations
  useEffect(() => {
    if (article) {
      const hasLocations = article.meta_data?.some(
        (entity) => entity.kind === "location",
      );
      setMapOpen(hasLocations ? desiredMapState : false);
    }
  }, [article, desiredMapState]);

  const navigateToArticle = (index: number) => {
    if (index >= 0 && index < allArticles.length) {
      router.push(`/article/${allArticles[index].id}`);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (highlightsOpen) setHighlightsOpen(false);
        else if (summaryOpen) setSummaryOpen(false);
        else if (topicsOpen) setTopicsOpen(false);
        else if (entitiesOpen) setEntitiesOpen(false);
        else if (mapOpen) {
          setMapOpen(false);
          setDesiredMapState(false);
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [highlightsOpen, summaryOpen, topicsOpen, entitiesOpen, mapOpen]);

  if (loading) return <div className="p-4 text-gray-900">Loading...</div>;
  if (!article)
    return <div className="p-4 text-gray-900">Article not found</div>;

  // Panel toggle handlers
  const handleHighlightsToggle = () => setHighlightsOpen(!highlightsOpen);
  const handleSummaryToggle = () => setSummaryOpen(!summaryOpen);
  const handleTopicsToggle = () => setTopicsOpen(!topicsOpen);
  const handleEntitiesToggle = () => setEntitiesOpen(!entitiesOpen);
  const handleMapToggle = () => {
    const newState = !desiredMapState;
    setDesiredMapState(newState);
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="px-4 sm:px-8">
        <div className="mx-auto">
          {/* Navigation buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6">
            <button
              onClick={() =>
                router.push(
                  `/?sortField=${sortField}&sortDirection=${sortDirection}`,
                )
              }
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" /> Lista articoli
            </button>
            <div className="w-px h-4 bg-gray-300" />
            <button
              onClick={() => navigateToArticle(currentIndex - 1)}
              disabled={currentIndex <= 0}
              className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 ${
                currentIndex <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ArrowUp className="w-4 h-4" /> Precedente
            </button>
            <button
              onClick={() => navigateToArticle(currentIndex + 1)}
              disabled={currentIndex >= allArticles.length - 1}
              className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 ${
                currentIndex >= allArticles.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <ArrowDown className="w-4 h-4" /> Successivo
            </button>
          </div>

          {/* MeMa logo and button controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <Image
              src="/mema.svg"
              alt="MeMa Logo"
              width={64}
              height={24}
              className="w-16 h-6"
            />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={handleTopicsToggle}
                className={`px-3 sm:px-6 py-2 rounded-full transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                  topicsOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <Hash className="w-4 h-4" />
                Argomenti
              </button>

              <button
                onClick={handleSummaryToggle}
                className={`px-3 sm:px-6 py-2 rounded-full transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                  summaryOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                Sommario
              </button>

              <button
                onClick={handleHighlightsToggle}
                className={`px-3 sm:px-6 py-2 rounded-full transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                  highlightsOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <Highlighter className="w-4 h-4" />
                Punti salienti
              </button>

              {article.meta_data?.some(
                (entity) => entity.kind === "location",
              ) && (
                <button
                  onClick={handleMapToggle}
                  className={`px-3 sm:px-6 py-2 rounded-full transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                    mapOpen
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Mappa
                </button>
              )}

              <button
                onClick={handleEntitiesToggle}
                className={`px-3 sm:px-6 py-2 rounded-full transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                  entitiesOpen
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <Microscope className="w-4 h-4" />
                Entità e dettagli
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="relative mt-6">
            <ArticleContent
              article={article}
              summaryOpen={summaryOpen}
              setSummaryOpen={setSummaryOpen}
              highlightsOpen={highlightsOpen}
              setHighlightsOpen={setHighlightsOpen}
              topicsOpen={topicsOpen}
              setTopicsOpen={setTopicsOpen}
              mapOpen={mapOpen}
              setMapOpen={setMapOpen}
              setDesiredMapState={setDesiredMapState}
              entitiesOpen={entitiesOpen}
              setEntitiesOpen={setEntitiesOpen}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
