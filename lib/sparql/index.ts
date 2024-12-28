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

export async function executeSparqlQuery(queryId: QueryId): Promise<SparqlResponse> {
  try {
    console.log(`Executing SPARQL query: ${queryId}`);
    const response = await fetch(`/api/sparql?queryId=${queryId}`);
    
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
