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

const QUERY_TIMEOUT = 25000; // 25 second timeout

async function fetchWithTimeout(
  queryId: QueryId
): Promise<Response> {
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn(`Query ${queryId} timed out after ${timeout}ms`);
  }, timeout);

  try {
    const response = await fetch(`/api/sparql?queryId=${queryId}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Add cache control headers
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
    
    // Handle network errors and retries
    const isRetryable = 
      (error.name === 'AbortError' || 
       error.name === 'TypeError' || 
       error.message.includes('Failed to fetch') ||
       error.message.includes('HTTP error!')) && 
      attempt <= MAX_RETRIES;

    console.error(`Query ${queryId} failed:`, error);
    throw new Error(`Query ${queryId} failed: ${error.message}`);
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
      console.error(`SPARQL query ${queryId} failed with status ${response.status}:`, errorText);
      throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error(`Failed to parse JSON response for ${queryId}:`, error);
      throw new Error(`Invalid JSON response for query ${queryId}`);
    }
    console.log(`SPARQL response for ${queryId}:`, data);
    
    // Cache the result
    queryCache.set(queryId, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Failed to execute SPARQL query ${queryId}:`, error);
    throw error;
  }
}
