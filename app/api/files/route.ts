import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

// Define interfaces for article types
interface LinkingSourceInfo {
  source: string;
  url?: string;
  title?: string;
  summary?: string;
  timestamp?: string;
  geoid?: number;
  name?: string;
  feature_class?: string;
  feature_code?: string;
  lat?: number;
  lng?: number;
  country_name?: string;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
}

interface MetaDataItem {
  id: string;
  kind: string;
  label: string;
  score: number | null;
  linking_info: LinkingSourceInfo[];
}

interface RawArticle {
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
  mema_summary: string[];
  mema_highlights: string[];
  mema_topics: string[];
}

interface ProcessedArticle extends Omit<RawArticle, 'date_created'> {
  datePublished: string;
  slug: string;
  highlights: {
    highlight_text: string;
    highlight_sequence_number: number;
  }[];
}

function generateSlug(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    console.log('Looking for files in:', dataDir)
    const files = await readdir(dataDir)
    console.log('Found files:', files)
    const articles: ProcessedArticle[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(dataDir, file)
          console.log('Reading file:', filePath)
          const content = await readFile(filePath, 'utf8')
          const parsed: RawArticle[] = JSON.parse(content)
          
          const articlesWithRequiredFields = parsed.map((article: RawArticle): ProcessedArticle => {
            return {
              ...article,
              datePublished: article.date_created,
              slug: generateSlug(article.headline),
              highlights: article.mema_highlights?.map((text: string, index: number) => ({
                highlight_text: text,
                highlight_sequence_number: index + 1
              })) || []
            };
          });
          
          articles.push(...articlesWithRequiredFields)
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError)
        }
      }
    }

    if (articles.length === 0) {
      console.log('No articles found')
      return NextResponse.json({ error: 'No articles found' }, { status: 404 })
    }

    console.log(`Found ${articles.length} articles`)
    return NextResponse.json(articles)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to read articles', details: errorMessage },
      { status: 500 }
    );
  }
}