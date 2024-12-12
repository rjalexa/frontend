"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Highlighter } from "lucide-react";
import { useRouter } from "next/navigation";
import { HighlightsPanel } from "../../../components/highlights/HighlightsPanel";
import EntitiesView from "./EntitiesView";

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

interface Entity {
  id: string;
  kind: "person" | "location" | "organization";
  label: string;
  summary?: string;
  coordinates?: string;
  linking_info?: LinkingInfo[];
}

interface Article {
  id: string;
  headline: string;
  meta_data?: Entity[];
  datePublished?: string;
  slug?: string;
}

interface PageParams {
  id: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default function ArticlePage({ params }: PageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"entities" | "other">("entities");
  const resolvedParams = React.use(params) as PageParams;
  const articleId = resolvedParams.id;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch("/api/files");
        const articles: Article[] = await response.json();
        const found = articles.find((a: Article) => a.id === articleId);
        setArticle(found || null);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();

    // Add escape key handler
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !highlightsOpen) {
        router.push("/");
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleEscKey);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [articleId, router]);

  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const getIcon = (kind: Entity["kind"]) => {
    switch (kind) {
      case "location":
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case "person":
        return <User className="w-5 h-5 text-green-500" />;
      case "organization":
        return <Building className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const hasLocationsWithCoordinates = (): boolean => {
    if (!article?.meta_data) return false;

    return article.meta_data.some(
      (entity) =>
        entity.kind === "location" &&
        entity.linking_info?.[1]?.lat &&
        entity.linking_info?.[1]?.lng
    );
  };

  const filterEntities = (): Entity[] => {
    if (!article?.meta_data) return [];

    const entities =
      selectedType === "all"
        ? article.meta_data
        : article.meta_data.filter((entity) => entity.kind === selectedType);

    // Sort function that puts locations first, then persons, then organizations
    return entities.sort((a, b) => {
      // First, sort by type priority
      const typePriority = {
        location: 1,
        person: 2,
        organization: 3,
      };

      const priorityDiff = typePriority[a.kind] - typePriority[b.kind];

      // If same type, sort alphabetically
      if (priorityDiff === 0) {
        return a.label.localeCompare(b.label, "en", { sensitivity: "base" });
      }

      return priorityDiff;
    });
  };

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
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </button>

        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          {article.headline}
        </h1>

        {/* Top row of buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveView("entities")}
            className={`px-6 py-2 rounded-full transition-colors ${
              activeView === "entities"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Entità e dettagli
          </button>
          <button
            onClick={() => {
              setSelectedArticle(article);
              setHighlightsOpen(true);
            }}
            className="px-6 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-2 transition-colors"
          >
            <Highlighter className="w-4 h-4" />
            Punti salienti
          </button>
          {/* Add more view buttons here as needed */}
        </div>

        {/* Content area */}
        <div className="mt-6">
          {activeView === "entities" && <EntitiesView article={article} />}
          {/* Add more view components here as needed */}
        </div>
      </div>

      {selectedArticle && (
        <HighlightsPanel
          isOpen={highlightsOpen}
          onClose={() => setHighlightsOpen(false)}
          articleTitle={selectedArticle.headline}
          datePublished={selectedArticle.datePublished}
          slug={selectedArticle.slug}
        />
      )}
    </div>
  );
}
