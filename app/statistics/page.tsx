// app/statistics/page.tsx
import StatsCard from '@/components/statistics/StatsCard';
import { executeSparqlQuery } from '@/lib/sparql';

export const revalidate = 3600; // Revalidate every hour

// This runs only on the server
async function getStatistics() {
  try {
    const [totalArticles, uniqueAuthors, uniqueLocations] = await Promise.all([
      executeSparqlQuery('totalArticles'),
      executeSparqlQuery('uniqueAuthors'),
      executeSparqlQuery('uniqueLocations'),
    ]);

    // Process the data server-side before sending to client
    return {
      totalArticles: Number(totalArticles.results.bindings[0].count.value),
      uniqueAuthors: Number(uniqueAuthors.results.bindings[0].count.value),
      uniqueLocations: Number(uniqueLocations.results.bindings[0].count.value),
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}

export default async function StatisticsPage() {
  // This runs server-side
  const stats = await getStatistics();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Articles"
          value={stats.totalArticles.toLocaleString()}
        />
        <StatsCard 
          title="Unique Authors"
          value={stats.uniqueAuthors.toLocaleString()}
        />
        <StatsCard 
          title="Unique Locations"
          value={stats.uniqueLocations.toLocaleString()}
        />
      </div>
    </div>
  );
}