import { NextRequest, NextResponse } from "next/server";
import { ENDPOINTS, SPARQL_CACHE_DURATION_MS } from "@/src/config/constants";

// Define allowed message types
type LogMessage = string | number | boolean | null | undefined;

interface ILogger {
  info(message: LogMessage, ...metadata: unknown[]): void;
  error(message: LogMessage, ...metadata: unknown[]): void;
}

const logger: ILogger = {
  info(message: LogMessage, ...metadata: unknown[]): void {
    // Only log in non-production environments and allow console statements
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, ...metadata);
    }
  },
  error(message: LogMessage, ...metadata: unknown[]): void {
    // Allow console.error statements for error logging
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...metadata);
  },
};

export type QueryId =
  | "dateRange"
  | "totalArticles"
  | "uniqueAuthors"
  | "topAuthors"
  | "uniqueLocations"
  | "topLocations"
  | "totalPeople"
  | "topPeople";

export interface ISparqlValue {
  value: string;
  type: string;
}

export interface ISparqlResponse {
  results: {
    bindings: Array<Record<string, ISparqlValue>>;
  };
}

// Simple cache implementation
interface CacheEntry {
  data: ISparqlResponse;
  timestamp: number;
}

const queryCache = new Map<QueryId, CacheEntry>();

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
  uniqueLocations: `
   PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   SELECT (COUNT(DISTINCT ?location) AS ?count)
   WHERE {
     ?location rdf:type mema:Location .
   }
 `,
  totalPeople: `
   PREFIX mema: <https://ilmanifesto.it/mema/ontology#>
   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   SELECT (COUNT(DISTINCT ?person) AS ?count)
   WHERE {
     ?person rdf:type mema:Person .
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
};

interface SparqlErrorResponse {
  error: string;
  details: string;
}

const addCacheHeaders = (response: NextResponse, timestamp: number) => {
  const age = Math.floor((Date.now() - timestamp) / 1000);
  const maxAge = Math.floor(SPARQL_CACHE_DURATION_MS / 1000);
  
  response.headers.set('Cache-Control', `public, max-age=${maxAge}`);
  response.headers.set('Age', age.toString());
  response.headers.set('X-Cache-Status', 'HIT');
  
  return response;
};

const handleSparqlError = async (
  response: Response,
): Promise<NextResponse<SparqlErrorResponse>> => {
  let errorDetail: string;
  try {
    errorDetail = await response.text();
  } catch {
    errorDetail = response.statusText;
  }

  const errorMessage = `SPARQL endpoint connection failed (${response.status}): ${errorDetail}`;
  logger.error(errorMessage);

  const errorResponse = response.status === 404
    ? {
        error: "SPARQL endpoint not found. Please verify the endpoint URL and dataset name.",
        details: errorDetail,
      }
    : response.status === 403 || response.status === 401
    ? {
        error: "Authentication failed for SPARQL endpoint.",
        details: errorDetail,
      }
    : {
        error: "SPARQL query failed",
        details: errorDetail,
      };

  const nextResponse = NextResponse.json(errorResponse, { status: response.status });
  nextResponse.headers.set('Cache-Control', 'no-store');
  return nextResponse;
};

const isCacheValid = (cacheEntry: CacheEntry | undefined): boolean => {
  if (!cacheEntry) {
    logger.info("Cache miss: No cache entry found");
    return false;
  }
  
  const now = Date.now();
  const age = now - cacheEntry.timestamp;
  const isValid = age < SPARQL_CACHE_DURATION_MS;
  
  logger.info(`Cache ${isValid ? 'hit' : 'miss'}: Age ${Math.round(age / 1000)}s / ${Math.round(SPARQL_CACHE_DURATION_MS / 1000)}s`);
  
  return isValid;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryId = searchParams.get("queryId") as QueryId;
  const forceRefresh = searchParams.get("refresh") === "true";

  if (!queryId || !SPARQL_QUERIES[queryId]) {
    return NextResponse.json(
      { error: "Invalid query ID" },
      { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  const endpoint = ENDPOINTS.memav6;
  if (!endpoint) {
    logger.error("SPARQL endpoint configuration missing");
    return NextResponse.json(
      { error: "SPARQL endpoint not configured" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  // Check cache first if not forcing refresh
  const cachedEntry = queryCache.get(queryId);
  if (!forceRefresh && cachedEntry && isCacheValid(cachedEntry)) {
    logger.info(`Serving cached data for query: ${queryId}`);
    const response = NextResponse.json(cachedEntry.data);
    return addCacheHeaders(response, cachedEntry.timestamp);
  }

  logger.info(`Fetching fresh data for query: ${queryId} from endpoint: ${endpoint}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      ENDPOINTS.SPARQL_QUERY_TIMEOUT_MS,
    );

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/sparql-results+json",
        "Content-Type": "application/sparql-query",
      },
      body: SPARQL_QUERIES[queryId],
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return handleSparqlError(response);
    }

    const data: ISparqlResponse = await response.json();
    const timestamp = Date.now();

    // Cache the successful response
    queryCache.set(queryId, {
      data,
      timestamp,
    });

    const nextResponse = NextResponse.json(data);
    return addCacheHeaders(nextResponse, timestamp);
  } catch (error) {
    let errorMessage: string;

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Timeout della connessione al grafo SPARQL";
      } else if (error.message.includes("fetch")) {
        errorMessage = "Grafo SPARQL irraggiungibile";
      } else {
        errorMessage = "Errore di connessione al grafo SPARQL";
      }
    } else {
      errorMessage = "Unknown error executing SPARQL query";
    }

    logger.error("SPARQL query failed:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}