'use client';

import { QueryId, executeSparqlQuery } from '@/lib/sparql';
import { useEffect, useRef } from 'react';

interface StatLoaderProps {
  queryId: QueryId;
  onData: (data: any) => void;
  onError?: (error: Error) => void;
}

export default function StatLoader({ queryId, onData, onError }: StatLoaderProps) {
  const retryCount = useRef(0);
  useEffect(() => {
    let isMounted = true;
    const loadStat = async () => {
      try {
        const startTime = performance.now();
        const res = await executeSparqlQuery(queryId);
        const duration = performance.now() - startTime;
        
        if (!isMounted) return;
        
        if (!res?.results?.bindings) {
          console.error(`Invalid response structure for ${queryId}:`, res);
          return;
        }
        
        console.log(`Query ${queryId} completed in ${duration.toFixed(0)}ms`);
        onData(res);
      } catch (error) {
        if (!isMounted) return;
        console.error(`Error loading stat ${queryId}:`, error);
        if (onError) {
          onError(error);
        }
      }
    };

    loadStat();
    
    return () => {
      isMounted = false;
    };
  }, [queryId, onData]);

  return null;
}
