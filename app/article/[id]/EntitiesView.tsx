"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { MapPin, User, Building } from "lucide-react";

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
}

interface EntitiesViewProps {
  article: Article;
}

export default function EntitiesView({ article }: EntitiesViewProps) {
  const [selectedType, setSelectedType] = React.useState<
    "all" | "person" | "location" | "organization"
  >("all");

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

    return entities.sort((a, b) => {
      const typePriority = {
        location: 1,
        person: 2,
        organization: 3,
      };

      const priorityDiff = typePriority[a.kind] - typePriority[b.kind];

      if (priorityDiff === 0) {
        return a.label.localeCompare(b.label, "en", { sensitivity: "base" });
      }

      return priorityDiff;
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
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
      </div>

      {article.meta_data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filterEntities().map((entity, index, array) => {
            const isLastLocation =
              index > 0 &&
              entity.kind !== "location" &&
              array[index - 1]?.kind === "location";

            return (
              <React.Fragment key={entity.id}>
                {isLastLocation && hasLocationsWithCoordinates() && (
                  <div className="col-span-full flex justify-center mb-4">
                    <a
                      href={`/map/${article.id}?mode=all`}
                      className="px-6 py-3 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-5 h-5" />
                      Mostra la mappa
                    </a>
                  </div>
                )}
                <Card className="hover:shadow-lg transition-shadow bg-white border-gray-200">
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
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-700">
          No entity data available for this article
        </div>
      )}
    </div>
  );
}