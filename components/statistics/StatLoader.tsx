'use client';

import { QueryId, executeSparqlQuery } from '@/lib/sparql';
import { useEffect, useRef, useState } from 'react';

interface StatLoaderProps {
  queryId: QueryId;
  onData: (data: any) => void;
  onError?: (error: Error) => void;
}

const QUERY_TIMEOUT = 30000; // 30 seconds

export default function StatLoader({ queryId, onData, onError }: StatLoaderProps) {
  const [hasAttempted, setHasAttempted] = useState(false);
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    
    if (hasAttempted) {
      return; // Don't retry if we've already attempted
    }

    const loadStat = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT);
        });

        const queryPromise = executeSparqlQuery(queryId);
        const res = await Promise.race([queryPromise, timeoutPromise]);
        
        if (!isMounted.current) return;
        
        if (!res?.results?.bindings) {
          throw new Error('Invalid response structure');
        }
        
        onData(res);
      } catch (error) {
        if (!isMounted.current) return;
        console.error(`Error loading stat ${queryId}:`, error);
        if (onError) {
          onError(error);
        }
      } finally {
        if (isMounted.current) {
          setHasAttempted(true);
        }
      }
    };

    loadStat();
    
    return () => {
      isMounted.current = false;
    };
  }, [queryId, onData, onError, hasAttempted]);

  return null;
}
