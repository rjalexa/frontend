import { ENDPOINTS } from '@/src/config/constants';
import { NextRequest, NextResponse } from 'next/server';

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

export type QueryId = 
  | 'dateRange'
  | 'totalArticles'
  | 'uniqueAuthors'
  | 'topAuthors'
  | 'uniqueLocations'
  | 'topLocations'
  | 'totalPeople'
  | 'topPeople';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryId = searchParams.get('queryId') as QueryId;

  if (!queryId || !SPARQL_QUERIES[queryId]) {
    return NextResponse.json({ error: 'Invalid query ID' }, { status: 400 });
  }

  const endpoint = ENDPOINTS.memav6;
  if (!endpoint) {
    return NextResponse.json({ error: 'SPARQL endpoint not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/sparql-results+json',
        'Content-Type': 'application/sparql-query',
      },
      body: SPARQL_QUERIES[queryId],
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL query failed: ${response.statusText} - ${errorText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse SPARQL response:', jsonError);
      const responseText = await response.text();
      console.error('Raw response:', responseText);
      return NextResponse.json(
        { 
          error: 'Invalid SPARQL response format',
          details: jsonError.message,
          raw: responseText.substring(0, 500) // First 500 chars for debugging
        },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!data?.results?.bindings) {
      console.error('Invalid SPARQL response structure:', data);
      return NextResponse.json(
        { 
          error: 'Invalid SPARQL response structure',
          received: JSON.stringify(data).substring(0, 500)
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('SPARQL query failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute SPARQL query',
        message: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}
