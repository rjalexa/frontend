import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

// For the debug logger
interface IDebugData {
  articleId?: string | null;
  count?: number;
  error?: {
    message: string;
    stack?: string;
    name: string;
  } | unknown;
}

// Create a proper logger utility to handle console warnings
const logger = {
  debug: (message: string, data?: IDebugData) => {
    // You might want to disable this in production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[Highlights Debug] ${message}`);
      if (data) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }
};

// For the raw data from merged-ai.json
interface IRawHighlight {
  highlight_article_mema_id: string;
  highlight_type: string;
  highlight_text: string;
  highlight_sequence_number: number;
  highlight_article_author: string;
  highlight_article_date: string;
}

// For the processed highlight data
interface IProcessedHighlight {
  highlight_text: string;
  highlight_sequence_number: number;
  highlight_type: string;
  highlight_article_author: string;
  highlight_article_date: string;
}

// For the API response
interface IHighlightsResponse {
  highlights: IProcessedHighlight[];
  count: number;
  debug: {
    timestamp: string;
    articleId: string;
    query: string;
  };
}

// For the error response
interface IErrorResponse {
  error: string;
  fallback: boolean;
  highlights: never[];
  count: 0;
  debug: {
    error: string;
    timestamp: string;
    type: string;
    details?: string;
  };
}

export async function GET(request: Request) {
  logger.debug('Starting highlights request');
  
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    logger.debug('Request parameters:', { articleId });

    if (!articleId) {
      logger.debug('No articleId provided');
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const dataPath = path.join(process.cwd(), 'data', 'merged-ai.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as IRawHighlight[];

    const articleHighlights = jsonData.filter((item: IRawHighlight) =>
      item.highlight_article_mema_id === articleId &&
      item.highlight_type === 'LLM'
    );

    const sortedHighlights = articleHighlights.sort(
      (a: IRawHighlight, b: IRawHighlight) => 
        a.highlight_sequence_number - b.highlight_sequence_number
    );

    const highlights: IProcessedHighlight[] = sortedHighlights.map((highlight) => ({
      highlight_text: highlight.highlight_text,
      highlight_sequence_number: highlight.highlight_sequence_number,
      highlight_type: highlight.highlight_type,
      highlight_article_author: highlight.highlight_article_author,
      highlight_article_date: highlight.highlight_article_date
    }));

    logger.debug('Processed highlights:', { count: highlights.length });

    const response: IHighlightsResponse = {
      highlights,
      count: highlights.length,
      debug: {
        timestamp: new Date().toISOString(),
        articleId,
        query: 'Success'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.debug('Error in highlights API:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });

    const errorResponse: IErrorResponse = {
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
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}