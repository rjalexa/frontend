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

const QUERY_TIMEOUT = 10000; // 10 second timeout
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithTimeout(
  queryId: QueryId,
  attempt: number = 1
): Promise<Response> {
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
    
    const response = await fetchWithTimeout(queryId);
    
    const duration = performance.now() - startTime;
    console.log(`Query ${queryId} completed in ${duration.toFixed(0)}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL query failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`SPARQL response for ${queryId}:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to execute SPARQL query ${queryId}:`, error);
    throw error;
  }
}
