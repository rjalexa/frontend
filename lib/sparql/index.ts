// lib/sparql/index.ts
export type QueryId = 
  | 'dateRange'
  | 'totalArticles'
  | 'uniqueAuthors'
  | 'topAuthors'
  | 'uniqueLocations'
  | 'topLocations'
  | 'totalPeople'
  | 'topPeople';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const queryCache = new Map<string, { data: SparqlResponse; timestamp: number }>();

export interface SparqlResponse {
  results: {
    bindings: Array<{
      [key: string]: {
        value: string;
        type?: string;
      };
    }>;
  };
}

const QUERY_TIMEOUT = 3500; // 3.5 second timeout
const MAX_RETRIES = 1; // Reduce retries since they're likely to timeout too
const RETRY_DELAY = 500; // 0.5 second - faster retry
const LONG_QUERIES = ['topAuthors', 'topLocations', 'topPeople'];

async function fetchWithTimeout(
  queryId: QueryId,
  attempt: number = 1
): Promise<Response> {
  // Adjust timeout for known long-running queries
  const timeout = LONG_QUERIES.includes(queryId) ? 
    QUERY_TIMEOUT * 1.5 : // Give 50% more time
    QUERY_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn(`Query ${queryId} timed out after ${QUERY_TIMEOUT}ms`);
  }, QUERY_TIMEOUT);

  try {
    const response = await fetch(`/api/sparql?queryId=${queryId}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError' && attempt <= MAX_RETRIES) {
      console.log(`Retrying query ${queryId}, attempt ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithTimeout(queryId, attempt + 1);
    }
    throw error;
  }
}

export async function executeSparqlQuery(queryId: QueryId): Promise<SparqlResponse> {
  try {
    const startTime = performance.now();
    console.log(`Executing SPARQL query: ${queryId}`);

    // Check cache
    const cached = queryCache.get(queryId);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_DURATION) {
        console.log(`Using cached result for ${queryId} (age: ${(age/1000).toFixed(1)}s)`);
        return cached.data;
      } else {
        console.log(`Cache expired for ${queryId} (age: ${(age/1000).toFixed(1)}s)`);
      }
    }
    
    const response = await fetchWithTimeout(queryId);
    
    const duration = performance.now() - startTime;
    console.log(`Query ${queryId} completed in ${duration.toFixed(0)}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL query failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`SPARQL response for ${queryId}:`, data);
    
    // Cache the result
    queryCache.set(queryId, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Failed to execute SPARQL query ${queryId}:`, error);
    throw error;
  }
}
