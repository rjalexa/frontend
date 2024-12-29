// lib/articles.ts
import { readdir, readFile } from 'fs/promises'
import path from 'path'

import type { Article } from '@/types/article'
import type { Entity, EntityKind, MetaDataItem } from '@/types/entity'
import type { RawArticle } from '@/types/raw'

/* eslint-disable import/no-unused-modules */

// Export the interface so it can be used by the API route
export interface IProcessedArticle extends Omit<Article, 'dateCreated'> {
  highlights: {
    highlight_text: string;
    highlight_sequence_number: number;
  }[];
}

class ArticleService {
  private static instance: ArticleService;
  private articles: IProcessedArticle[] | null = null;

  private constructor() {}

  public static getInstance(): ArticleService {
    if (!ArticleService.instance) {
      ArticleService.instance = new ArticleService();
    }
    return ArticleService.instance;
  }

  private generateSlug(headline: string): string {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private convertMetaDataToEntity(metaData: MetaDataItem): Entity {
    return {
      id: metaData.id,
      kind: metaData.kind as EntityKind,
      label: metaData.label,
      linking_info: metaData.linking_info
    };
  }

  public async getArticles(): Promise<IProcessedArticle[]> {
    if (this.articles) {
      return this.articles;
    }

    try {
      const dataDir = path.join(process.cwd(), 'data')
      const files = await readdir(dataDir)
      const articles: IProcessedArticle[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(dataDir, file)
          const content = await readFile(filePath, 'utf8')
          const parsed: RawArticle[] = JSON.parse(content)
          
          const articlesWithRequiredFields = parsed.map((article: RawArticle): IProcessedArticle => {
            return {
              ...article,
              title: article.headline,
              datePublished: article.date_created,
              slug: this.generateSlug(article.headline),
              meta_data: article.meta_data?.map(this.convertMetaDataToEntity) || [],
              highlights: article.mema_highlights?.map((text: string, index: number) => ({
                highlight_text: text,
                highlight_sequence_number: index + 1
              })) || []
            };
          });
          
          articles.push(...articlesWithRequiredFields)
        }
      }

      this.articles = articles;
      return articles;
    } catch (error) {
      console.error('Error loading articles:', error);
      throw error;
    }
  }
}

export const articleService = ArticleService.getInstance();