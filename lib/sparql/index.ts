/* eslint-disable import/no-unused-modules */
// lib/sparql/index.ts

import { logger } from "@/utils/logger";

const QUERY_TIMEOUT = 30000; // 30 second timeout

export type QueryId = 
  | 'dateRange'
  | 'totalArticles'
  | 'uniqueAuthors'
  | 'topAuthors'
  | 'uniqueLocations'
  | 'topLocations'
  | 'totalPeople'
  | 'topPeople';

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const queryCache = new Map<string, { data: ISparqlResponse; timestamp: number }>();

export interface ISparqlResponse {
  results: {
    bindings: Array<{
      [key: string]: {
        value: string;
        type?: string;
      };
    }>;
  };
}

class QueryTimeoutError extends Error {
  constructor(queryId: string) {
    super(`Query ${queryId} timed out after ${QUERY_TIMEOUT}ms`);
    this.name = 'QueryTimeoutError';
  }
}

async function fetchWithTimeout(queryId: QueryId): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, QUERY_TIMEOUT);

  try {
    const response = await fetch(`/api/sparql?queryId=${queryId}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-cache',
      credentials: 'same-origin',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new QueryTimeoutError(queryId);
      }
      throw error;
    }
    
    // If it's not an Error instance, wrap it
    throw new Error(`Unknown error during query ${queryId}: ${String(error)}`);
  }
}

export async function executeSparqlQuery(queryId: QueryId): Promise<ISparqlResponse> {
  try {
    const startTime = performance.now();
    logger.debug(`Executing SPARQL query: ${queryId}`);

    // Check cache
    const cached = queryCache.get(queryId);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_DURATION) {
        logger.debug(`Using cached result for ${queryId} (age: ${(age/1000).toFixed(1)}s)`);
        return cached.data;
      } else {
        logger.debug(`Cache expired for ${queryId} (age: ${(age/1000).toFixed(1)}s)`);
      }
    }
    
    const response = await fetchWithTimeout(queryId);
    
    const duration = performance.now() - startTime;
    logger.debug(`Query ${queryId} completed in ${duration.toFixed(0)}ms`);

    let data;
    try {
      data = await response.json();
    } catch (error) {
      logger.error(`Failed to parse JSON response for ${queryId}:`, error);
      throw new Error(`Invalid JSON response for query ${queryId}`);
    }
    
    if (!data?.results?.bindings) {
      logger.error(`Invalid SPARQL response structure for ${queryId}:`, data);
      throw new Error(`Invalid SPARQL response structure for query ${queryId}`);
    }
    
    // Cache the result
    queryCache.set(queryId, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    if (error instanceof QueryTimeoutError) {
      logger.error(error.message);
    } else {
      logger.error(`Failed to execute SPARQL query ${queryId}:`, error);
    }
    throw error;
  }
}