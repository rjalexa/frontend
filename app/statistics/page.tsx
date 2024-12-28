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
        console.log('Fetching statistics...');
        const queries = [
          'totalArticles',
          'uniqueAuthors',
          'uniqueLocations',
          'totalPeople',
          'topAuthors',
          'topLocations',
          'topPeople'
        ];

        const results = await Promise.all(
          queries.map(async (queryId) => {
            try {
              const res = await executeSparqlQuery(queryId);
              console.log(`Query ${queryId} response:`, res);
              // Validate response structure
              if (!res?.results?.bindings) {
                console.error(`Invalid response structure for ${queryId}:`, res);
                throw new Error(`Invalid response structure for ${queryId}`);
              }
              if (res.results.bindings.length === 0) {
                console.warn(`Empty results for ${queryId}`);
              }
              return res;
            } catch (error) {
              console.error(`Error executing query ${queryId}:`, error);
              throw error;
            }
          })
        );

        const [
          totalArticlesRes,
          uniqueAuthorsRes,
          uniqueLocationsRes,
          totalPeopleRes,
          topAuthorsRes,
          topLocationsRes,
          topPeopleRes
        ] = results;

        const newStats: Statistics = {};
        
        // Process single value responses
        if (totalArticlesRes.results.bindings[0]?.count) {
          newStats.totalArticles = Number(totalArticlesRes.results.bindings[0].count.value);
        }
        if (uniqueAuthorsRes.results.bindings[0]?.count) {
          newStats.uniqueAuthors = Number(uniqueAuthorsRes.results.bindings[0].count.value);
        }
        if (uniqueLocationsRes.results.bindings[0]?.count) {
          newStats.uniqueLocations = Number(uniqueLocationsRes.results.bindings[0].count.value);
        }
        if (totalPeopleRes.results.bindings[0]?.count) {
          newStats.totalPeople = Number(totalPeopleRes.results.bindings[0].count.value);
        }

        // Process list responses
        // Process list responses with validation
        if (topAuthorsRes.results.bindings.length > 0) {
          newStats.topAuthors = topAuthorsRes.results.bindings
            .filter(b => b.author?.value && b.count?.value)
            .map(b => ({
              label: b.author.value,
              value: Number(b.count.value)
            }));
        }
        
        if (topLocationsRes.results.bindings.length > 0) {
          newStats.topLocations = topLocationsRes.results.bindings
            .filter(b => b.location?.value && b.count?.value)
            .map(b => ({
              label: b.location.value,
              value: Number(b.count.value)
            }));
        }
        
        if (topPeopleRes.results.bindings.length > 0) {
          newStats.topPeople = topPeopleRes.results.bindings
            .filter(b => b.person?.value && b.count?.value)
            .map(b => ({
              label: b.person.value,
              value: Number(b.count.value)
            }));
        }

        console.log('Processed statistics:', newStats);
        setStats(newStats
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
