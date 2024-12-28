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