// src/config/constants.ts
const SPARQL_ENDPOINT = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT;

if (!SPARQL_ENDPOINT) {
  throw new Error(
    "NEXT_PUBLIC_SPARQL_ENDPOINT environment variable is not set in a .env file",
  );
}

export const ENDPOINTS = {
  memav6: `${SPARQL_ENDPOINT}`,
  SPARQL_QUERY_TIMEOUT_MS: 30000, // 30 seconds timeout for SPARQL queries
} as const;

export const SPARQL_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Type for the ENDPOINTS constant
export type EndpointsType = typeof ENDPOINTS;
