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

const QUERY_TIMEOUT = 5000; // 5 second timeout

export async function executeSparqlQuery(queryId: QueryId): Promise<SparqlResponse> {
  try {
    const startTime = performance.now();
    console.log(`Executing SPARQL query: ${queryId}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT);
    
    const response = await fetch(`/api/sparql?queryId=${queryId}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
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
