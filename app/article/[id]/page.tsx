"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { MapPin, User, Building, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Highlighter } from "lucide-react";
import { HighlightsPanel } from "../../../components/highlights/HighlightsPanel";

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
  const [selectedType, setSelectedType] = useState<
    "all" | "person" | "location" | "organization"
  >("all");
  const [loading, setLoading] = useState(true);

  // Type the params properly
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
  }, [articleId]);

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
          onClick={() => router.push("/")}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </button>

        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          {article.headline}
        </h1>

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded transition-colors ${
                selectedType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType("person")}
              className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                selectedType === "person"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <User className="w-4 h-4" /> People
            </button>
            <button
              onClick={() => setSelectedType("location")}
              className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                selectedType === "location"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <MapPin className="w-4 h-4" /> Locations
            </button>
            <button
              onClick={() => setSelectedType("organization")}
              className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                selectedType === "organization"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <Building className="w-4 h-4" /> Organizations
            </button>
          </div>
          {hasLocationsWithCoordinates() && (
            <div className="mt-6 flex justify-center">
              <a
                href={`/map/${article.id}?mode=all`}
                className="px-6 py-3 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Mostra la mappa
              </a>
            </div>
          )}

          {/* Add highlights button container */}
          <div className="ml-auto">
            <button
              onClick={() => {
                setSelectedArticle(article);
                setHighlightsOpen(true);
              }}
              className="px-4 py-2 rounded bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-2 transition-colors"
            >
              <Highlighter className="w-4 h-4" />
              Punti salienti
            </button>
          </div>
        </div>


        {article.meta_data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterEntities().map((entity) => (
              <Card
                key={entity.id}
                className="hover:shadow-lg transition-shadow bg-white border-gray-200"
              >
                {entity.kind === "location" && entity.linking_info?.[1] ? (
                  <>
                    <CardHeader className="flex flex-row items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg">
                        {entity.linking_info[1].lat &&
                        entity.linking_info[1].lng ? (
                          <a
                            href={`/map/${article.id}?lat=${
                              entity.linking_info[1].lat
                            }&lng=${entity.linking_info[1].lng}${
                              entity.linking_info[1].bbox
                                ? `&north=${entity.linking_info[1].bbox.north}&south=${entity.linking_info[1].bbox.south}&east=${entity.linking_info[1].bbox.east}&west=${entity.linking_info[1].bbox.west}`
                                : ""
                            }&name=${encodeURIComponent(entity.label)}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {entity.label}
                          </a>
                        ) : (
                          <span className="text-gray-900">{entity.label}</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        {entity.linking_info[0].summary.split(".")[0]}.
                      </p>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader className="flex flex-row items-center gap-2">
                      {getIcon(entity.kind)}
                      <CardTitle className="text-lg text-gray-900">
                        {entity.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {entity.summary && (
                        <p className="text-gray-700 mb-2">{entity.summary}</p>
                      )}

                      {/* Show Wikipedia summary for people and organizations */}
                      {(entity.kind === "person" ||
                        entity.kind === "organization") &&
                        entity.linking_info?.[0]?.summary && (
                          <p className="text-gray-600 text-sm mt-1">
                            {entity.linking_info[0].summary.split(".")[0]}.
                          </p>
                        )}
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-700">
            No entity data available for this article
          </div>
        )}
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
