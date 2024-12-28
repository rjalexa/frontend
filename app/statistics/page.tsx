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
  const [loading, setLoading] = useState(true);

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
    const loadStats = () => {
      setLoading(true);
      console.log('Fetching statistics...');
      
      // Load queries in priority order
      const queryPriorities: QueryId[][] = [
        // Priority 1: Fast basic counts
        ['totalArticles', 'uniqueAuthors'],
        // Priority 2: Additional counts
        ['uniqueLocations', 'totalPeople'],
        // Priority 3: Complex top-N queries
        ['topAuthors'],
        // Priority 4: Remaining top-N queries
        ['topLocations', 'topPeople']
      ];

      // Show initial content quickly
      const timeout = setTimeout(() => setLoading(false), 2000);

      return queryPriorities;
    };

    loadStats();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Statistiche</h1>
      {/* Priority 1 & 2 queries */}
      {['totalArticles', 'uniqueAuthors', 'uniqueLocations', 'totalPeople'].map((queryId) => (
        <StatLoader 
          key={queryId} 
          queryId={queryId as QueryId} 
          onData={(res) => processStatResult(queryId as QueryId, res)}
          onError={() => setErrors(prev => ({ ...prev, [queryId]: true }))}
        />
      ))}
      
      {/* Priority 3 query */}
      {!loading && (
        <StatLoader 
          key="topAuthors"
          queryId="topAuthors"
          onData={(res) => processStatResult('topAuthors', res)}
        />
      )}
      
      {/* Priority 4 queries - load last */}
      {!loading && stats.topAuthors && ['topLocations', 'topPeople'].map((queryId) => (
        <StatLoader 
          key={queryId} 
          queryId={queryId as QueryId} 
          onData={(res) => processStatResult(queryId as QueryId, res)} 
        />
      ))}
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
