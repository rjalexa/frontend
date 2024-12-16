import React from "react";
import { Microscope, MapPin, User, Building } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Article, Entity, EntityKind, WikipediaLinkingInfo, GeonamesLinkingInfo, AILinkingInfo } from '@/lib/types';
import type { BasePanelProps } from '../article/panels/types';

interface EntitiesPanelProps extends BasePanelProps {
  article: Article;
}

type EntityTypeFilter = "all" | EntityKind;

const getTruncatedSummary = (summary: string): string => {
  // Short summaries return as-is
  if (summary.length <= 100) return summary;
  
  // Common abbreviations to avoid truncating at
  const commonAbbreviations = /(?:[A-Z]\.|Dr\.|Mr\.|Mrs\.|Ms\.|Dott\.|lett\.|Prof\.|Sen\.|On\.|Dep\.|Jr\.|Sr\.|Ph\.D\.|U\.S\.A\.|U\.S\.|D\.C\.|St\.|Ave\.|Ing\.|Arch\.|Avv\.|Rag\.|Geom\.|Cap\.|Col\.|Gen\.|Comm\.|Cav\.|S\.E\.|S\.p\.A\.|S\.r\.l\.|v\.le|p\.zza|sig\.|sig\.ra|n\.|Co\.|Inc\.|Ltd\.|LLC|Corp\.|N\.V\.|B\.V\.|GmbH|S\.A\.|A\.G\.|plc\.|etc\.|es\.|art\.|vol\.|ed\.|pag\.|fig\.|tab\.|Soc\.|Az\.|Dir\.|Amm\.|Ind\.|Int\.|Spa|srl|snc|sas)/g;
  
  
  // Split on periods but preserve them
  const parts = summary.split(/(?<=\.)/);
  
  let result = '';
  let currentPart = '';
  
  for (const part of parts) {
    currentPart += part;
    
    // If we're past minimum length and this part doesn't end with an abbreviation
    if (currentPart.length >= 100 && !commonAbbreviations.test(part.trim())) {
      result = currentPart;
      break;
    }
  }
  
  // If we couldn't find a good truncation point, return full summary
  return result || summary;
}

export function EntitiesPanel({ isOpen, onClose, article }: EntitiesPanelProps) {
  const [selectedType, setSelectedType] = React.useState<EntityTypeFilter>("all");

  if (!isOpen) return null;

  const getIcon = (kind: EntityKind) => {
    switch (kind) {
      case "location":
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case "person":
        return <User className="w-5 h-5 text-green-500" />;
      case "organization":
        return <Building className="w-5 h-5 text-purple-500" />;
    }
  };

  const isGeonamesInfo = (info: any): info is GeonamesLinkingInfo => {
    return info?.source === "geonames";
  };

  const isWikipediaInfo = (info: any): info is WikipediaLinkingInfo => {
    return info?.source === "wikipedia";
  };

  const filterEntities = (): Entity[] => {
    if (!article?.meta_data) return [];

    const entities =
      selectedType === "all"
        ? article.meta_data
        : article.meta_data.filter((entity) => entity.kind === selectedType);

    return entities.sort((a, b) => {
      const typePriority: Record<EntityKind, number> = {
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

  const renderLocationCard = (entity: Entity) => {
    const geonamesInfo = entity.linking_info?.find(isGeonamesInfo);
    const wikipediaInfo = entity.linking_info?.find(isWikipediaInfo);

    return (
      <>
        <CardHeader className="flex flex-row items-center gap-2 p-3">
          <MapPin className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg">
            {geonamesInfo?.lat && geonamesInfo?.lng ? (
              <a
                href={`/map/${article.id}?lat=${geonamesInfo.lat}&lng=${geonamesInfo.lng}${
                  geonamesInfo.bbox
                    ? `&north=${geonamesInfo.bbox.north}&south=${geonamesInfo.bbox.south}&east=${geonamesInfo.bbox.east}&west=${geonamesInfo.bbox.west}`
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
        <CardContent className="pt-0 px-3 pb-3">
          {wikipediaInfo && (
            <p className="text-gray-600 text-sm">
              {getTruncatedSummary(wikipediaInfo.summary)}
            </p>
          )}
        </CardContent>
      </>
    );
  };

  const renderDefaultCard = (entity: Entity) => {
    const wikipediaInfo = entity.linking_info?.find(isWikipediaInfo);
    const aiInfo = entity.linking_info?.find((info): info is AILinkingInfo => info.source === 'ai');

    return (
      <>
        <CardHeader className="flex flex-row items-center gap-2 p-3">
          {getIcon(entity.kind)}
          <CardTitle className="text-lg text-gray-900">
            {entity.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0 px-3 pb-3">
          {entity.summary && (
            <p className="text-gray-700 text-sm">{entity.summary}</p>
          )}
          {(entity.kind === "person" || entity.kind === "organization") && (
            <>
              {wikipediaInfo?.summary && (
                <p className="text-gray-600 text-sm">
                  {getTruncatedSummary(wikipediaInfo.summary)}
                </p>
              )}
              {aiInfo?.summary && (
                <div className="text-gray-600 text-sm">
                  <p className="flex items-center gap-1">
                    <img src="/mema.svg" alt="MeMa" className="w-8 h-3" />
                    <span className="italic">{aiInfo.summary}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </>
    );
  };

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <Microscope className="w-4 h-4" />
          <span>Entità e dettagli</span>
        </div>
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6 ml-6" />
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
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

        {article.meta_data ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterEntities().map((entity) => (
              <Card 
                key={entity.id} 
                className="hover:shadow-lg transition-shadow bg-white border-gray-200"
              >
                {entity.kind === "location" 
                  ? renderLocationCard(entity)
                  : renderDefaultCard(entity)
                }
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-700">
            No entity data available for this article
          </div>
        )}
      </div>
    </div>
  );
}