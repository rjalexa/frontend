import { NextResponse } from 'next/server';
import weaviate from 'weaviate-ts-client';
import type { WeaviateClient } from 'weaviate-ts-client';

// Configuration constants
const WEAVIATE_HOST = 'localhost';
const WEAVIATE_PORT = '8080';
const COLLECTION_NAME = 'Delta_highlights';

const debugLog = (message: string, data?: any) => {
  console.log(`[Highlights Debug] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Create Weaviate client with better error handling
const getWeaviateClient = async (): Promise<WeaviateClient> => {
  try {
    debugLog('Creating Weaviate client');
    
    const client = weaviate.client({
      scheme: 'http',
      host: `${WEAVIATE_HOST}:${WEAVIATE_PORT}`
    });

    // Test the connection
    debugLog('Testing connection');
    await client.schema.getter().do();
    debugLog('Connection test successful');

    return client;
  } catch (error) {
    debugLog('Error initializing Weaviate client', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    throw error;
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

    debugLog('Initializing Weaviate client');
    const client = await getWeaviateClient();

    // First, get the schema to see what fields are available
    const schema = await client.schema.getter().do();
    debugLog('Current schema:', schema);

    const deltaHighlightsClass = schema.classes?.find(c => c.class === COLLECTION_NAME);
    if (!deltaHighlightsClass) {
      throw new Error(`Class ${COLLECTION_NAME} not found in schema`);
    }

    debugLog('Delta_highlights class schema:', deltaHighlightsClass);

    // Looking for the article reference field
    const propertyNames = deltaHighlightsClass.properties?.map(p => p.name);
    debugLog('Available properties:', propertyNames);

    debugLog('Building GraphQL query for article', { articleId });
    const result = await client.graphql
      .get()
      .withClassName(COLLECTION_NAME)
      .withFields('highlight_text highlight_sequence_number highlight_type highlight_article_author highlight_article_date')
      .withWhere({
        operator: 'Equal',
        path: ['highlight_article_mema_id'],
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

    // Check if it's a connection error
    if (error instanceof Error && 
       (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch'))) {
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
          type: 'unexpected_error',
          details: error instanceof Error ? error.stack : undefined
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