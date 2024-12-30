"use client";

import { useEffect, useState, useCallback } from "react";
import ListStatsCard from "@/components/statistics/ListStatsCard";
import StatsCard from "@/components/statistics/StatsCard";
import { QueryId } from "@/app/api/sparql/route";
import { executeSparqlQuery } from "@/lib/sparql";

// Interfaces
interface IDateRange {
  oldestDate?: string;
  mostRecentDate?: string;
}

interface IErrorResponse {
  error: string;
}

interface IListItem {
  label: string;
  value: number;
}

interface IQueryResults {
  dateRange?: IDateRange;
  totalArticles?: number;
  uniqueAuthors?: number;
  uniqueLocations?: number;
  totalPeople?: number;
  topAuthors?: IListItem[];
  topLocations?: IListItem[];
  topPeople?: IListItem[];
}

interface IQueryStatus {
  status: Record<string, "loading" | "success" | "error">;
  errorMessage?: string;
}


// Helper function
function isNameVariation(shortName: string, fullName: string): boolean {
  const shortParts = shortName.match(/[A-Z][a-z]+/g) || [];
  const fullParts = fullName.match(/[A-Z][a-z]+/g) || [];

  if (shortParts.length > fullParts.length) {
    return false;
  }

  let fullIndex = 0;
  for (const shortPart of shortParts) {
    while (fullIndex < fullParts.length && fullParts[fullIndex] !== shortPart) {
      fullIndex++;
    }
    if (fullIndex >= fullParts.length) {
      return false;
    }
    fullIndex++;
  }
  return true;
}

export default function StatisticsPage() {
  const [results, setResults] = useState<IQueryResults>({});
  const [queryStatus, setQueryStatus] = useState<IQueryStatus>({ status: {} });

  const executeQuery = useCallback(async (queryId: QueryId) => {
    setQueryStatus((prev) => ({ 
      ...prev, 
      status: { ...prev.status, [queryId]: "loading" }
    }));

    try {
      const data = await executeSparqlQuery(queryId);
      
      // Check if the response contains an error
      if ('error' in data && typeof data.error === 'string') {
        console.error(`Query ${queryId} failed:`, data.error);
        setQueryStatus((prev) => ({ 
          ...prev,
          status: { ...prev.status, [queryId]: "error" },
          errorMessage: data.error
        }));
        return;
      }

      setResults((prev) => {
        const newResults = { ...prev };

        switch (queryId) {
          case "dateRange": {
            if (data.results.bindings[0]) {
              newResults.dateRange = {
                oldestDate: data.results.bindings[0].oldestDate?.value,
                mostRecentDate: data.results.bindings[0].mostRecentDate?.value,
              };
            }
            break;
          }

          case "totalArticles":
          case "uniqueAuthors":
          case "uniqueLocations":
          case "totalPeople": {
            if (data.results.bindings[0]?.count?.value) {
              newResults[queryId] = parseInt(
                data.results.bindings[0].count.value,
              );
            }
            break;
          }

          case "topAuthors": {
            newResults.topAuthors = data.results.bindings.map((binding) => ({
              label: binding.authorName.value,
              value: parseInt(binding.article_count.value),
            }));
            break;
          }

          case "topLocations": {
            newResults.topLocations = data.results.bindings.map((binding) => ({
              label: binding.locationName.value,
              value: parseInt(binding.mention_count.value),
            }));
            break;
          }

          case "topPeople": {
            const initialCounts = new Map<string, number>();
            data.results.bindings.forEach((binding) => {
              const name = binding.personLabel.value;
              const count = parseInt(binding.mentions_count.value);
              initialCounts.set(name, count);
            });

            const aggregatedCounts = new Map<string, number>();
            const processedNames = new Set<string>();

            const sortedNames = Array.from(initialCounts.keys()).sort(
              (a, b) => b.length - a.length,
            );

            for (const name of sortedNames) {
              if (processedNames.has(name)) continue;

              let totalCount = initialCounts.get(name) || 0;
              const variations: string[] = [name];

              for (const otherName of sortedNames) {
                if (otherName !== name && !processedNames.has(otherName)) {
                  if (
                    isNameVariation(otherName, name) ||
                    isNameVariation(name, otherName)
                  ) {
                    totalCount += initialCounts.get(otherName) || 0;
                    variations.push(otherName);
                    processedNames.add(otherName);
                  }
                }
              }

              const canonicalName = variations.sort((a, b) => {
                const aParts = a.match(/[A-Z][a-z]+/g) || [];
                const bParts = b.match(/[A-Z][a-z]+/g) || [];
                if (aParts.length === 1 && bParts.length > 1) return 1;
                if (bParts.length === 1 && aParts.length > 1) return -1;
                return a.length - b.length;
              })[0];

              aggregatedCounts.set(canonicalName, totalCount);
              processedNames.add(name);
            }

            newResults.topPeople = Array.from(aggregatedCounts)
              .map(([label, value]) => ({ label, value }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 20);

            break;
          }
        }

        return newResults;
      });

      setQueryStatus((prev) => ({ 
        ...prev,
        status: { ...prev.status, [queryId]: "success" }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error executing query';
      console.error(`Query ${queryId} failed:`, errorMessage);
      setQueryStatus((prev) => ({ 
        ...prev,
        status: { ...prev.status, [queryId]: "error" },
        errorMessage: errorMessage
      }));
    }
  }, []);

  const executeAllQueries = useCallback(() => {
    const queries: QueryId[] = [
      "dateRange",
      "totalArticles",
      "uniqueAuthors",
      "uniqueLocations",
      "totalPeople",
      "topAuthors",
      "topLocations",
      "topPeople",
    ];

    queries.forEach((queryId) => {
      executeQuery(queryId);
    });
  }, [executeQuery]);

  useEffect(() => {
    executeAllQueries();
  }, [executeAllQueries]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {queryStatus.status.dateRange === "error" && queryStatus.errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Errore di Connessione: </strong>
          <span className="block sm:inline">{queryStatus.errorMessage}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {queryStatus.status.dateRange === "loading"
          ? "Esecuzione query..."
          : queryStatus.status.dateRange === "error"
            ? "Errore di connessione al database"
            : results.dateRange
              ? `Articoli dal ${formatDate(
                  results.dateRange.oldestDate,
                )} al ${formatDate(results.dateRange.mostRecentDate)}`
              : "Statistiche"}
      </h1>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Articoli Totali"
            value={results.totalArticles}
            isLoading={queryStatus.status.totalArticles === "loading"}
            hasError={queryStatus.status.totalArticles === "error"}
            errorMessage={queryStatus.errorMessage}
          />
          <StatsCard
            title="Autori Unici"
            value={results.uniqueAuthors}
            isLoading={queryStatus.status.uniqueAuthors === "loading"}
            hasError={queryStatus.status.uniqueAuthors === "error"}
            errorMessage={queryStatus.errorMessage}
          />
          <StatsCard
            title="Località Uniche"
            value={results.uniqueLocations}
            isLoading={queryStatus.status.uniqueLocations === "loading"}
            hasError={queryStatus.status.uniqueLocations === "error"}
            errorMessage={queryStatus.errorMessage}
          />
          <StatsCard
            title="Persone Totali"
            value={results.totalPeople}
            isLoading={queryStatus.status.totalPeople === "loading"}
            hasError={queryStatus.status.totalPeople === "error"}
            errorMessage={queryStatus.errorMessage}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ListStatsCard
            title="Autori più citati"
            items={results.topAuthors}
            isLoading={queryStatus.status.topAuthors === "loading"}
            hasError={queryStatus.status.topAuthors === "error"}
            errorMessage={queryStatus.errorMessage}
          />
          <ListStatsCard
            title="Località più citate"
            items={results.topLocations}
            isLoading={queryStatus.status.topLocations === "loading"}
            hasError={queryStatus.status.topLocations === "error"}
            errorMessage={queryStatus.errorMessage}
          />
          <ListStatsCard
            title="Persone più citate"
            items={results.topPeople}
            isLoading={queryStatus.status.topPeople === "loading"}
            hasError={queryStatus.status.topPeople === "error"}
            errorMessage={queryStatus.errorMessage}
          />
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Ricalcola statistiche
          </button>
        </div>
      </div>
    </div>
  );
}
