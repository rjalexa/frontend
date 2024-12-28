// app/statistics/page.tsx
'use client';

import StatsCard from '@/components/statistics/StatsCard';
import ListStatsCard from '@/components/statistics/ListStatsCard';
import StatLoader from '@/components/statistics/StatLoader';
import { executeSparqlQuery } from '@/lib/sparql';
import { useEffect, useState } from 'react';

interface ListItem {
  label: string;
  value: number;
}

interface Statistics {
  totalArticles?: number;
  uniqueAuthors?: number;
  uniqueLocations?: number;
  totalPeople?: number;
  topAuthors?: ListItem[];
  topLocations?: ListItem[];
  topPeople?: ListItem[];
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [queryTimeouts, setQueryTimeouts] = useState<Set<string>>(new Set());

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const processStatResult = (queryId: QueryId, res: any) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      
      // Process single value stats
      if (['totalArticles', 'uniqueAuthors', 'uniqueLocations', 'totalPeople'].includes(queryId)) {
        if (res.results.bindings[0]?.count) {
          newStats[queryId] = Number(res.results.bindings[0].count.value);
        }
      }
      
      // Process list stats
      if (queryId === 'topAuthors' && res.results.bindings.length > 0) {
        newStats.topAuthors = res.results.bindings
          .filter(b => b.author?.value && b.count?.value)
          .map(b => ({
            label: b.author.value,
            value: Number(b.count.value)
          }));
      }
      
      if (queryId === 'topLocations' && res.results.bindings.length > 0) {
        newStats.topLocations = res.results.bindings
          .filter(b => b.location?.value && b.count?.value)
          .map(b => ({
            label: b.location.value,
            value: Number(b.count.value)
          }));
      }
      
      if (queryId === 'topPeople' && res.results.bindings.length > 0) {
        newStats.topPeople = res.results.bindings
          .filter(b => b.person?.value && b.count?.value)
          .map(b => ({
            label: b.person.value,
            value: Number(b.count.value)
          }));
      }
      
      return newStats;
    });
  };

  useEffect(() => {
    const queries: QueryId[] = [
      'totalArticles',
      'uniqueAuthors',
      'uniqueLocations',
      'totalPeople',
      'topAuthors',
      'topLocations',
      'topPeople'
    ];

    setLoading(true);
    console.log('Fetching statistics...');

    // Launch all queries in parallel
    queries.forEach(queryId => {
      const timeoutId = setTimeout(() => {
        setErrors(prev => ({ ...prev, [queryId]: true }));
      }, 25000); // 25 second timeout

      executeSparqlQuery(queryId)
        .then(res => {
          clearTimeout(timeoutId);
          processStatResult(queryId, res);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error(`Query ${queryId} failed:`, error);
          setErrors(prev => ({ ...prev, [queryId]: true }));
        });
    });

    // Show initial loading state for at least 2 seconds
    const loadingTimeout = setTimeout(() => setLoading(false), 2000);
    
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Statistiche</h1>
      {/* Basic stats loaders - only render once */}
      <div className="hidden">
        <StatLoader 
          key="totalArticles"
          queryId="totalArticles"
          onData={(res) => processStatResult('totalArticles', res)}
          onError={() => {
            setErrors(prev => ({ ...prev, totalArticles: true }));
            setQueryTimeouts(prev => new Set([...prev, 'totalArticles']));
          }}
        />
        <StatLoader 
          key="uniqueAuthors"
          queryId="uniqueAuthors"
          onData={(res) => processStatResult('uniqueAuthors', res)}
          onError={() => setErrors(prev => ({ ...prev, uniqueAuthors: true }))}
        />
        <StatLoader 
          key="uniqueLocations"
          queryId="uniqueLocations"
          onData={(res) => processStatResult('uniqueLocations', res)}
          onError={() => setErrors(prev => ({ ...prev, uniqueLocations: true }))}
        />
        <StatLoader 
          key="totalPeople"
          queryId="totalPeople"
          onData={(res) => processStatResult('totalPeople', res)}
          onError={() => setErrors(prev => ({ ...prev, totalPeople: true }))}
        />
        
        {/* Complex queries */}
        {!loading && (
          <>
            <StatLoader 
              key="topAuthors"
              queryId="topAuthors"
              onData={(res) => processStatResult('topAuthors', res)}
            />
            {stats.topAuthors && (
              <>
                <StatLoader 
                  key="topLocations"
                  queryId="topLocations"
                  onData={(res) => processStatResult('topLocations', res)}
                />
                <StatLoader 
                  key="topPeople"
                  queryId="topPeople"
                  onData={(res) => processStatResult('topPeople', res)}
                />
              </>
            )}
          </>
        )}
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Articoli Totali"
            value={stats.totalArticles}
            isLoading={loading || typeof stats.totalArticles === 'undefined'}
          />
          <StatsCard 
            title="Autori Unici"
            value={stats.uniqueAuthors}
            isLoading={loading || typeof stats.uniqueAuthors === 'undefined'}
          />
          <StatsCard 
            title="Località Uniche"
            value={stats.uniqueLocations}
            isLoading={loading || typeof stats.uniqueLocations === 'undefined'}
          />
          <StatsCard 
            title="Persone Totali"
            value={stats.totalPeople}
            isLoading={loading || typeof stats.totalPeople === 'undefined'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ListStatsCard
            title="Autori più citati"
            items={stats.topAuthors}
            isLoading={loading || typeof stats.topAuthors === 'undefined'}
          />
          <ListStatsCard
            title="Località più citate"
            items={stats.topLocations}
            isLoading={loading || typeof stats.topLocations === 'undefined'}
          />
          <ListStatsCard
            title="Persone più citate"
            items={stats.topPeople}
            isLoading={loading || typeof stats.topPeople === 'undefined'}
          />
        </div>
      </div>
    </div>
  );
}
