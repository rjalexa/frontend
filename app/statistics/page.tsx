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
      
      // Start all queries independently
      const queries: QueryId[] = [
        'totalArticles',
        'uniqueAuthors',
        'uniqueLocations',
        'totalPeople',
        'topAuthors',
        'topLocations',
        'topPeople'
      ];

      // Set a timeout to show content even if some queries are still loading
      setTimeout(() => setLoading(false), 5000);

      return queries;
    };

    loadStats();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Statistiche</h1>
      {['totalArticles', 'uniqueAuthors', 'uniqueLocations', 'totalPeople', 
        'topAuthors', 'topLocations', 'topPeople'].map((queryId) => (
        <StatLoader 
          key={queryId} 
          queryId={queryId as QueryId} 
          onData={(res) => processStatResult(queryId as QueryId, res)} 
        />
      ))}
            try {
              const startTime = performance.now();
              const res = await executeSparqlQuery(queryId).catch(error => {
                console.error(`Failed to fetch ${queryId} after retries:`, error);
                return { results: { bindings: [] } };
              });
              const duration = performance.now() - startTime;
              console.log(`Query ${queryId} completed in ${duration.toFixed(0)}ms:`, res);
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
