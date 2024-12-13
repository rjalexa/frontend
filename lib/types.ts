export type SortField = "date_created" | "headline" | "author";
export type SortDirection = "asc" | "desc";

export interface LinkingInfo {
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

export interface Entity {
  id: string;
  kind: "person" | "location" | "organization";
  label: string;
  summary?: string;
  coordinates?: string;
  linking_info?: LinkingInfo[];
}

export interface Article {
  id: string;
  headline: string;
  author?: string;
  datePublished?: string;
  date_created: string;
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
  mema_topics?: string[];
  highlights?: Array<{
    highlight_text: string;
    highlight_sequence_number: number;
  }>;
}