// src/config/constants.ts
const SPARQL_ENDPOINT = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT;

if (!SPARQL_ENDPOINT) {
  throw new Error("NEXT_PUBLIC_SPARQL_ENDPOINT environment variable is not set in a .env file");
}

export const ENDPOINTS = {
  memav6: `${SPARQL_ENDPOINT}`,
} as const;