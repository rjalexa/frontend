// types/article.ts
import { Entity } from './entity';
import { Highlight } from './panel';

export interface Article {
  id: string;
  title: string;
  datePublished: string;
  date_created: string;
  author: string;
  slug: string;
  source?: string;
  articleBody?: string;
  articleKicker?: string;
  content?: string;
  meta_data?: Entity[];
  highlights?: Highlight[];
  mema_summary?: string;
  mema_topics?: string[];
  articleTag?: string;
  topics?: string;
  tags?: string;
}

export type SortField = 'date_created' | 'title' | 'author';
export type SortDirection = 'asc' | 'desc';