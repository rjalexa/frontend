import { NextRequest, NextResponse } from "next/server";
import { ENDPOINTS } from "@/src/config/constants";

// Define allowed message types
type LogMessage = string | number | boolean | null | undefined;

// Custom logger interface
interface ILogger {
  info(message: LogMessage, ...metadata: unknown[]): void;
  error(message: LogMessage, ...metadata: unknown[]): void;
}

const logger: ILogger = {
  info(message: LogMessage, ...metadata: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, ...metadata);
    }
  },
  error(message: LogMessage, ...metadata: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...metadata);
  }
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

const handleSparqlError = async (response: Response): Promise<NextResponse<SparqlErrorResponse>> => {
  let errorDetail: string;
  try {
    const errorBody = await response.text();
    errorDetail = errorBody;
  } catch {
    errorDetail = response.statusText;
  }

  const errorMessage = `SPARQL endpoint connection failed (${response.status}): ${errorDetail}`;
  logger.error(errorMessage);

  if (response.status === 404) {
    return NextResponse.json(
      {
        error: "SPARQL endpoint not found. Please verify the endpoint URL and dataset name.",
        details: errorDetail,
      },
      { status: 404 }
    );
  }

  if (response.status === 403 || response.status === 401) {
    return NextResponse.json(
      {
        error: "Authentication failed for SPARQL endpoint.",
        details: errorDetail,
      },
      { status: response.status }
    );
  }

  return NextResponse.json(
    {
      error: "SPARQL query failed",
      details: errorDetail,
    },
    { status: response.status }
  );
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryId = searchParams.get("queryId") as QueryId;

  if (!queryId || !SPARQL_QUERIES[queryId]) {
    return NextResponse.json({ error: "Invalid query ID" }, { status: 400 });
  }

  const endpoint = ENDPOINTS.memav6;
  if (!endpoint) {
    logger.error("SPARQL endpoint configuration missing");
    return NextResponse.json(
      { error: "SPARQL endpoint not configured" },
      { status: 500 }
    );
  }

  logger.info(`Attempting to connect to SPARQL endpoint: ${endpoint}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    let errorMessage: string;

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "SPARQL endpoint connection timed out";
      } else if (error.message.includes("fetch")) {
        errorMessage =
          "Failed to connect to SPARQL endpoint. Please verify the endpoint URL and network connectivity.";
      } else {
        errorMessage = error.message;
      }
    } else {
      errorMessage = "Unknown error executing SPARQL query";
    }

    logger.error("SPARQL query failed:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}