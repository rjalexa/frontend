'use client';

import { QueryId, executeSparqlQuery } from '@/lib/sparql';
import { useEffect, useRef } from 'react';

interface StatLoaderProps {
  queryId: QueryId;
  onData: (data: any) => void;
}

export default function StatLoader({ queryId, onData }: StatLoaderProps) {
  useEffect(() => {
    const abortController = new AbortController();
    const loadStat = async () => {
      try {
        const startTime = performance.now();
        const res = await executeSparqlQuery(queryId);
        const duration = performance.now() - startTime;
        console.log(`Query ${queryId} completed in ${duration.toFixed(0)}ms:`, res);
        
        if (!res?.results?.bindings) {
          console.error(`Invalid response structure for ${queryId}:`, res);
          return;
        }
        
        onData(res);
      } catch (error) {
        console.error(`Error loading stat ${queryId}:`, error);
      }
    };

    loadStat();
    
    return () => {
      abortController.abort();
    };
  }, [queryId, onData]);

  return null;
}
