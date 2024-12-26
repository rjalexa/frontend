// src/config/constants.ts
const SPARQL_URL = process.env.NEXT_PUBLIC_SPARQL_URL;

if (!SPARQL_URL) {
  throw new Error('NEXT_PUBLIC_SPARQL_URL environment variable is not set');
}

export const ENDPOINTS = {
  memav6: `${SPARQL_URL}/mema_v6/query`,
} as const;