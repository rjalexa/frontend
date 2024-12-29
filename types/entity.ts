// types/entity.ts
export type EntityKind = "location" | "person" | "organization";

export interface GeonamesLinkingInfo {
  source: "geonames";
  url?: string;
  geoid?: number;
  name?: string;
  feature_class?: string;
  feature_code?: string;
  lat: number;
  lng: number;
  country_name?: string;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
}

export interface WikipediaLinkingInfo {
  source: "wikipedia";
  url: string;
  title: string;
  summary: string;
  timestamp: string;
}

export interface AILinkingInfo {
  source: "ai";
  summary: string;
}

export type LinkingInfo =
  | GeonamesLinkingInfo
  | WikipediaLinkingInfo
  | AILinkingInfo;

export interface MetaDataItem {
  id: string;
  kind: string;
  label: string;
  score: number | null;
  linking_info: LinkingInfo[];
}

export interface Entity {
  id: string;
  kind: EntityKind;
  label: string;
  linking_info?: LinkingInfo[];
  summary?: string;
}
