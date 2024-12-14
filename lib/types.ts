// lib/types.ts

// Entity kinds
export type EntityKind = 'location' | 'person' | 'organization';

// Base Entity interface
export interface Entity {
  id: string;
  kind: EntityKind;
  label: string;
  summary?: string;  // Optional entity-level summary
  linking_info?: LinkingInfo[]; // Optional array since it can have zero items
}

// Bounding box interface for geonames
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Different types of linking info based on source
export interface WikipediaLinkingInfo {
  source: 'wikipedia';
  url: string;
  title: string;
  summary: string;
  timestamp: string;
}

export interface GeonamesLinkingInfo {
  source: 'geonames';
  url: string;
  geoid: number;
  name: string;
  feature_class: string;
  feature_code: string;
  lat: number;
  lng: number;
  country_name: string;
  bbox: BoundingBox;
}

export interface AILinkingInfo {
  source: 'ai';
  summary: string;
}

// Union type for all linking info types
export type LinkingInfo = WikipediaLinkingInfo | GeonamesLinkingInfo | AILinkingInfo;

// Article interface
export interface Article {
  id: string;
  title: string;
  content: string;
  date_created: string;
  source: string;
  author?: string;
  meta_data?: Entity[];  // List of all entities (if any)
}

// Helper type to enforce one linking info per source
export type LinkingInfoMap = {
  wikipedia?: WikipediaLinkingInfo;
  geonames?: GeonamesLinkingInfo;
  ai?: AILinkingInfo;
}

// Type guard to check if an entity is a location
export function isLocationEntity(entity: Entity): boolean {
  return entity.kind === 'location';
}

// Type guard to check if linking info is geonames
export function isGeonamesLinkingInfo(info: LinkingInfo): info is GeonamesLinkingInfo {
  return info.source === 'geonames';
}

// Validation helper
export function validateEntityLinkingInfo(entity: Entity): boolean {
  // Check if location entities have at most one geonames linking info
  if (entity.kind === 'location') {
    const geonamesInfos = entity.linking_info?.filter(info => info.source === 'geonames') || [];
    return geonamesInfos.length <= 1;
  }
  // For non-location entities, ensure no geonames linking info
  return !entity.linking_info?.some(info => info.source === 'geonames');
}

// Additional types needed for the application
export type SortField = 'date_created' | 'title' | 'source';
export type SortDirection = 'asc' | 'desc';

export interface EntityKindCounts {
  location: number;
  person: number;
  organization: number;
}

// Component props
export interface ArticleContentProps {
  article: Article;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  highlightsOpen: boolean;
  setHighlightsOpen: (open: boolean) => void;
  topicsOpen: boolean;
  setTopicsOpen: (open: boolean) => void;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
}

export interface EntitiesViewProps {
  article: Article;
}