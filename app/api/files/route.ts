// app/api/files/route.ts
import { NextResponse } from 'next/server'

import { articleService, IProcessedArticle } from '@/lib/articles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<IProcessedArticle[] | { error: string, details?: string }>> {
  try {
    const articles = await articleService.getArticles()
    
    if (articles.length === 0) {
      return NextResponse.json({ error: 'No articles found' }, { status: 404 })
    }

    // Add cache control headers
    const headers = {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }

    return NextResponse.json(articles, { headers })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to read articles', details: errorMessage },
      { status: 500 }
    );
  }
}