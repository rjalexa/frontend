// types/raw.ts
import type { MetaDataItem } from './entity';

export interface RawArticle {
  headline: string;
  articleBody: string;
  excerpt: string | null;
  summary: string;
  articleKicker: string;
  id: string;
  date_created: string;
  articleTag: string;
  author: string;
  topics: string;
  tags: string;
  meta_data: MetaDataItem[];
  mema_summary: string;
  mema_highlights: string[];
  mema_topics: string[];
}