// app/statistics/page.tsx
'use client';

import StatsCard from '@/components/statistics/StatsCard';
import ListStatsCard from '@/components/statistics/ListStatsCard';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          totalArticlesRes,
          uniqueAuthorsRes,
          uniqueLocationsRes,
          totalPeopleRes,
          topAuthorsRes,
          topLocationsRes,
          topPeopleRes
        ] = await Promise.all([
          executeSparqlQuery('totalArticles'),
          executeSparqlQuery('uniqueAuthors'),
          executeSparqlQuery('uniqueLocations'),
          executeSparqlQuery('totalPeople'),
          executeSparqlQuery('topAuthors'),
          executeSparqlQuery('topLocations'),
          executeSparqlQuery('topPeople')
        ]);

        setStats({
          totalArticles: Number(totalArticlesRes.results.bindings[0].count.value),
          uniqueAuthors: Number(uniqueAuthorsRes.results.bindings[0].count.value),
          uniqueLocations: Number(uniqueLocationsRes.results.bindings[0].count.value),
          totalPeople: Number(totalPeopleRes.results.bindings[0].count.value),
          topAuthors: topAuthorsRes.results.bindings.map(b => ({
            label: b.author.value,
            value: Number(b.count.value)
          })),
          topLocations: topLocationsRes.results.bindings.map(b => ({
            label: b.location.value,
            value: Number(b.count.value)
          })),
          topPeople: topPeopleRes.results.bindings.map(b => ({
            label: b.person.value,
            value: Number(b.count.value)
          }))
        });
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
