import { NextResponse } from 'next/server';
import type { WeaviateClient } from 'weaviate-ts-client';

// Configuration constants - matching health check
const WEAVIATE_HOST = 'localhost';
const WEAVIATE_PORT = '8080';
const COLLECTION_NAME = 'Delta_highlights';

const debugLog = (message: string, data?: any) => {
  console.log(`[Highlights Debug] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Create Weaviate client
const getWeaviateClient = async (): Promise<WeaviateClient> => {
  const { Client } = await import('weaviate-ts-client');
  return new Client({
    scheme: 'http',
    host: `${WEAVIATE_HOST}:${WEAVIATE_PORT}`
  });
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

    debugLog('Initializing Weaviate client');
    const client = await getWeaviateClient();

    // First verify the collection exists
    const schema = await client.schema.getter().do();
    const collectionExists = schema?.classes?.some((c: any) => c.class === COLLECTION_NAME);
    
    if (!collectionExists) {
      throw new Error(`Collection '${COLLECTION_NAME}' not found in Weaviate`);
    }

    // Query to get highlights for the article
    const result = await client.graphql
      .get()
      .withClassName(COLLECTION_NAME)
      .withFields('highlight_text highlight_sequence_number')
      .withWhere({
        operator: 'Equal',
        path: ['articleId'],
        valueString: articleId
      })
      .do();

    debugLog('Weaviate query result:', result);

    if (!result.data?.Get?.[COLLECTION_NAME]) {
      return NextResponse.json({
        highlights: [],
        count: 0,
        debug: {
          timestamp: new Date().toISOString(),
          articleId,
          query: 'No highlights found'
        }
      });
    }

    const highlights = result.data.Get[COLLECTION_NAME].map((highlight: any) => ({
      highlight_text: highlight.highlight_text,
      highlight_sequence_number: highlight.highlight_sequence_number
    }));

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
    debugLog('Error in highlights API:', error);

    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again later.',
          fallback: true,
          highlights: [],
          count: 0,
          debug: {
            error: error.message,
            timestamp: new Date().toISOString(),
            type: 'connection_error'
          }
        },
        { 
          status: 200,
          headers: {
            'X-Service-Status': 'degraded',
            'X-Error-Type': 'connection'
          }
        }
      );
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        fallback: true,
        highlights: [],
        count: 0,
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          type: 'unexpected_error'
        }
      },
      { 
        status: 200,
        headers: {
          'X-Service-Status': 'degraded',
          'X-Error-Type': 'unexpected'
        }
      }
    );
  }
}
