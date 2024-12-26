// app/api/sparql/route.ts
import { NextRequest } from "next/server";
import { ENDPOINTS } from '@/src/config/constants';

export async function POST(request: NextRequest) {
  const endpoint = ENDPOINTS.memav6;
  
  if (!endpoint) {
    console.error('SPARQL endpoint URL is not configured');
    return Response.json(
      { error: 'SPARQL endpoint not configured' },
      { status: 500 }
    );
  }

  const query = await request.text();

  console.log('SPARQL request:', {
    endpoint,
    headers: Object.fromEntries(request.headers),
    query
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/sparql-results+json',
        'Content-Type': 'application/sparql-query',
        'Host': new URL(endpoint).host,
        'X-Forwarded-Host': request.headers.get('x-forwarded-host') || '',
        'X-Forwarded-Proto': request.headers.get('x-forwarded-proto') || 'https'
      },
      body: query,
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

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error in SPARQL query:', error);
    return Response.json(
      { error: String(error) }, 
      { status: 500 }
    );
  }
}