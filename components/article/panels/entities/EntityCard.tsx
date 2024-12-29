// components/entities/EntityCard.tsx
import { ChevronDown, ChevronUp, MapPin, User, Building } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Entity, 
  EntityKind, 
  LinkingInfo,
  GeonamesLinkingInfo,
  WikipediaLinkingInfo,
  AILinkingInfo 
} from '@/types/entity';


interface IEntityCardProps {
  entity: Entity;
}

const MAX_LINES = 2;
const LINE_HEIGHT = 1.5; // rem
const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT; // rem

const isGeonamesInfo = (info: LinkingInfo): info is GeonamesLinkingInfo => {
  return info?.source === "geonames";
};

const isWikipediaInfo = (info: LinkingInfo): info is WikipediaLinkingInfo => {
  return info?.source === "wikipedia";
};

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

export default function EntityCard({ entity }: IEntityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const pathname = usePathname();
  const articleId = pathname.split("/")[2];

  useEffect(() => {
    if (contentRef.current) {
      const hasOverflow =
        contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setIsOverflowing(hasOverflow);
    }
  }, [entity]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        event.stopPropagation(); // Prevent the event from bubbling up
      }
    };

    if (isExpanded) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isExpanded]);

  const renderContent = () => {
    const wikipediaInfo = entity.linking_info?.find(isWikipediaInfo);
    const aiInfo = entity.linking_info?.find(
      (info): info is AILinkingInfo => info.source === "ai"
    );

    return (
      <div className="space-y-2">
        {entity.summary && (
          <p className="text-gray-700 text-xs">{entity.summary}</p>
        )}
        {(entity.kind === "person" || entity.kind === "organization") && (
          <div className="space-y-2">
            {wikipediaInfo?.summary && (
              <p className="text-gray-600 text-sm">
                {wikipediaInfo.summary}
              </p>
            )}
            {aiInfo?.summary && (
              <div className="text-gray-600 text-sm">
                <p className="flex items-center gap-1">
                  <Image 
                    src="/mema.svg" 
                    alt="MeMa" 
                    width={32} 
                    height={12}
                    className="w-8 h-3" 
                  />
                  <span className="italic">{aiInfo.summary}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (entity.kind === "location") {
    const geonamesInfo = entity.linking_info?.find(isGeonamesInfo);
    const wikipediaInfo = entity.linking_info?.find(isWikipediaInfo);

    return (
      <Card className="hover:shadow-lg transition-shadow bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center gap-1.5 p-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-base text-gray-900">
            {geonamesInfo?.lat && geonamesInfo?.lng ? (
              <a
                href={`/map/${articleId}?lat=${geonamesInfo.lat}&lng=${
                  geonamesInfo.lng
                }${
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
        <CardContent className="pt-0 px-2 pb-1">
          {wikipediaInfo && (
            <div>
              <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-300 relative"
                style={{
                  lineHeight: `${LINE_HEIGHT}rem`,
                  maxHeight: isExpanded ? "none" : `${MAX_HEIGHT}rem`,
                }}
              >
                <p className="text-gray-600 text-sm">{wikipediaInfo.summary}</p>
                {!isExpanded && isOverflowing && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>

              {isOverflowing && (
                <button
                  className="w-full text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center gap-0.5 pt-0.5"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Dettagli <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow bg-white border-gray-200">
      <CardHeader className="flex flex-row items-center gap-2 p-3">
        {getIcon(entity.kind)}
        <CardTitle className="text-lg text-gray-900">{entity.label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-1">
        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-300 relative"
          style={{
            lineHeight: `${LINE_HEIGHT}rem`,
            maxHeight: isExpanded ? "none" : `${MAX_HEIGHT}rem`,
          }}
        >
          {renderContent()}
          {!isExpanded && isOverflowing && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {isOverflowing && (
          <button
            className="w-full text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center gap-0.5 pt-0.5"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Dettagli <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}