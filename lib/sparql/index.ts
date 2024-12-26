// lib/sparql/index.ts
import { headers } from 'next/headers';
import { ENDPOINTS } from '@/src/config/constants';

interface SparqlResponse {
  results: {
    bindings: Array<{
      [key: string]: {
        value: string;
        type?: string;
      };
    }>;
  };
}

type QueryId = 
  | 'dateRange'
  | 'totalArticles'
  | 'uniqueAuthors'
  | 'topAuthors'
  | 'uniqueLocations'
  | 'topLocations'
  | 'totalPeople'
  | 'topPeople';

const SPARQL_QUERIES: Record<QueryId, string> = {
    dateRange: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
      SELECT (MIN(?publishedDay) AS ?oldestDate) (MAX(?publishedDay) AS ?mostRecentDate)
      WHERE {
        ?article a mema:Article ;
                 mema:published_day ?publishedDay .
        FILTER(?publishedDay != "0000-00-00")
      }
    `,
    totalArticles: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#> 
      SELECT (COUNT(?article) AS ?count) 
      WHERE { 
        ?article a mema:Article 
      }
    `,
    uniqueAuthors: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
      SELECT (COUNT(DISTINCT ?author) AS ?count)
      WHERE {
        ?article a mema:Article ;
                 mema:authored_by ?author .
      }
    `,
    topAuthors: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?authorName (COUNT(?article) AS ?article_count)
      WHERE {
        ?article a mema:Article ;
                mema:authored_by ?author .
        ?author rdfs:label ?authorName .
      }
      GROUP BY ?authorName
      ORDER BY DESC(?article_count)
      LIMIT 20
    `,
    uniqueLocations: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      SELECT (COUNT(DISTINCT ?location) AS ?count)
      WHERE {
        ?location rdf:type mema:Location .
      }
    `,
    topLocations: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?locationName (COUNT(?article) AS ?mention_count)
      WHERE {
        ?article rdf:type mema:Article ;
                 mema:mentions ?location .
        ?location rdf:type mema:Location ;
                 rdfs:label ?locationName .
      }
      GROUP BY ?locationName
      ORDER BY DESC(?mention_count)
      LIMIT 20
    `,
    topPeople: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?personLabel (COUNT(?article) AS ?mentions_count)
      WHERE {
        ?article a mema:Article ;
                mema:mentions ?person .
        ?person rdfs:label ?personLabel .
        FILTER(CONTAINS(STR(?person), '/person/'))
      }
      GROUP BY ?personLabel
      ORDER BY DESC(?mentions_count)
      LIMIT 101
    `,
    totalPeople: `
      PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      SELECT (COUNT(DISTINCT ?person) AS ?uniquePersonCount)
      WHERE {
        ?person rdf:type mema:Person .
      }
    `
  };

// This function will only run on the server
export async function executeSparqlQuery(queryId: QueryId): Promise<SparqlResponse> {
  if (typeof window !== 'undefined') {
    throw new Error('SPARQL queries can only be executed server-side');
  }

  const query = SPARQL_QUERIES[queryId];
  if (!query) throw new Error(`Invalid query ID: ${queryId}`);

  const endpoint = ENDPOINTS.memav6;
  if (!endpoint) {
    throw new Error('SPARQL endpoint not configured');
  }

  const headersList = await headers();
  const host = headersList.get('host');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/sparql-results+json',
      'Content-Type': 'application/sparql-query',
      'Host': new URL(endpoint).host,
      'X-Forwarded-Host': host || '',
      'X-Forwarded-Proto': 'https'
    },
    body: query,
    cache: 'no-store'  // Ensures fresh data
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SPARQL query failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`SPARQL query failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}