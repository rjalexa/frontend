// app/statistics/page.tsx
'use client';

import StatsCard from '@/components/statistics/StatsCard';
import { executeSparqlQuery } from '@/lib/sparql';
import { useEffect, useState } from 'react';

interface Statistics {
  totalArticles?: number;
  uniqueAuthors?: number;
  uniqueLocations?: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalArticles, uniqueAuthors, uniqueLocations] = await Promise.all([
          executeSparqlQuery('totalArticles').then(res => {
            setStats(prev => ({ ...prev, totalArticles: Number(res.results.bindings[0].count.value) }));
            return res;
          }),
          executeSparqlQuery('uniqueAuthors').then(res => {
            setStats(prev => ({ ...prev, uniqueAuthors: Number(res.results.bindings[0].count.value) }));
            return res;
          }),
          executeSparqlQuery('uniqueLocations').then(res => {
            setStats(prev => ({ ...prev, uniqueLocations: Number(res.results.bindings[0].count.value) }));
            return res;
          }),
        ]);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Statistiche</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
