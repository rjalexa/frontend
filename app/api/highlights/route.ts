import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const debugLog = (message: string, data?: any) => {
  console.log(`[Highlights Debug] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

export async function GET(request: Request) {
  debugLog('Starting highlights request');

  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    debugLog('Request parameters:', { articleId });

    if (!articleId) {
      debugLog('No articleId provided');
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Read from merged-ai.json
    const dataPath = path.join(process.cwd(), 'data', 'merged-ai.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Filter highlights for the requested article
    const articleHighlights = jsonData.filter((item: any) => 
      item.highlight_article_mema_id === articleId && 
      item.highlight_type === 'LLM'
    );

    // Sort highlights by sequence number
    const sortedHighlights = articleHighlights.sort(
      (a: any, b: any) => a.highlight_sequence_number - b.highlight_sequence_number
    );

    const highlights = sortedHighlights.map((highlight: any) => ({
      highlight_text: highlight.highlight_text,
      highlight_sequence_number: highlight.highlight_sequence_number,
      highlight_type: highlight.highlight_type,
      highlight_article_author: highlight.highlight_article_author,
      highlight_article_date: highlight.highlight_article_date
    }));

    debugLog('Processed highlights:', { count: highlights.length });

    return NextResponse.json({
      highlights,
      count: highlights.length,
      debug: {
        timestamp: new Date().toISOString(),
        articleId,
        query: 'Success'
      }
    });

  } catch (error) {
    debugLog('Error in highlights API:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        fallback: true,
        highlights: [],
        count: 0,
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          type: 'unexpected_error',
          details: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}
