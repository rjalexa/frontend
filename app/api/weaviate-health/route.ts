// frontend/app/api/weaviate-health/route.ts
import { NextResponse } from 'next/server';

// Configuration constants
const WEAVIATE_HOST = 'localhost';
const WEAVIATE_PORT = '8080';
const GRPC_PORT = '50051';
const COLLECTION_NAME = 'Delta_highlights';

export async function GET() {
  try {
    // Check Weaviate REST API connection
    try {
      const weaviateHealthResponse = await fetch(`http://${WEAVIATE_HOST}:${WEAVIATE_PORT}/v1/.well-known/ready`, {
        // Adding a timeout to avoid long waits
        signal: AbortSignal.timeout(5000)
      });
      
      if (!weaviateHealthResponse.ok) {
        return NextResponse.json({ 
          error: `Weaviate REST API connection failed: Could not connect to ${WEAVIATE_HOST}:${WEAVIATE_PORT}. Status: ${weaviateHealthResponse.status}` 
        }, { status: 500 });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isConnectionRefused = errorMessage.includes('ECONNREFUSED');
      
      return NextResponse.json({ 
        error: isConnectionRefused
          ? `Could not establish connection to Weaviate at ${WEAVIATE_HOST}:${WEAVIATE_PORT}. Is Weaviate running?`
          : `Weaviate connection error at ${WEAVIATE_HOST}:${WEAVIATE_PORT}: ${errorMessage}`
      }, { status: 500 });
    }

    // Check schema/collection
    try {
      const schemaResponse = await fetch(`http://${WEAVIATE_HOST}:${WEAVIATE_PORT}/v1/schema`);
      if (!schemaResponse.ok) {
        return NextResponse.json({ 
          error: `Failed to fetch Weaviate schema from ${WEAVIATE_HOST}:${WEAVIATE_PORT}. Status: ${schemaResponse.status}` 
        }, { status: 500 });
      }

      const schema = await schemaResponse.json();
      const hasCollection = schema.classes?.some((c: any) => c.class === COLLECTION_NAME);
      
      if (!hasCollection) {
        return NextResponse.json(
          { error: `Collection '${COLLECTION_NAME}' not found in Weaviate at ${WEAVIATE_HOST}:${WEAVIATE_PORT}` }, 
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json({ 
        error: `Failed to check Weaviate schema at ${WEAVIATE_HOST}:${WEAVIATE_PORT}: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, { status: 500 });
    }

    // Check gRPC connection (you might want to implement a proper health check endpoint)
    try {
      const grpcResponse = await fetch(`http://${WEAVIATE_HOST}:${GRPC_PORT}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!grpcResponse.ok) {
        return NextResponse.json({ 
          error: `gRPC connection failed: Could not connect to ${WEAVIATE_HOST}:${GRPC_PORT}` 
        }, { status: 500 });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isConnectionRefused = errorMessage.includes('ECONNREFUSED');
      
      // Only log gRPC connection issues but don't fail the health check
      console.warn(`Note: gRPC connection check failed at ${WEAVIATE_HOST}:${GRPC_PORT}: ${
        isConnectionRefused ? 'Connection refused' : errorMessage
      }`);
    }

    // If we get here, all checks passed
    return NextResponse.json({ 
      status: 'ok',
      message: `Successfully connected to Weaviate at ${WEAVIATE_HOST}:${WEAVIATE_PORT} and verified collection '${COLLECTION_NAME}' exists` 
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: `Unexpected error during database connection check: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, 
      { status: 500 }
    );
  }
}