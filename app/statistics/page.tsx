// app/statistics/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

import AnimatedCounter from "@/components/statistics/AnimatedCounter";
import { QueryId, executeSparqlQuery } from "@/lib/sparql";
import {
  IQueryResults,
  IQueryStatus,
  IErrorResponse,
} from "@components/statistics/types";

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

const MetricCard = ({
  title,
  value,
  status,
}: {
  title: string;
  value: number | undefined;
  status: "loading" | "error" | "success" | undefined;
}) => (
  <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
    <div className="px-6 py-8">
      <div className="font-medium text-gray-500 uppercase tracking-wide text-sm">
        {title}
      </div>
      <div className="mt-3 flex items-center">
        {status === "loading" || value === undefined ? (
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded" />
        ) : status === "error" ? (
          <span className="text-gray-500">Dati non disponibili</span>
        ) : (
          <div className="text-3xl font-bold text-gray-900">
            <AnimatedCounter value={value} />
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function StatisticsPage() {
  const [results, setResults] = useState<IQueryResults>(() => ({}));
  const [queryStatus, setQueryStatus] = useState<IQueryStatus>(() => ({
    status: {},
  }));

  const executeQuery = useCallback(async (queryId: QueryId) => {
    setQueryStatus((prev) => ({
      ...prev,
      status: { ...prev.status, [queryId]: "loading" },
    }));

    try {
      const data = await executeSparqlQuery(queryId);

      if ("error" in data && typeof data.error === "string") {
        const errorResponse = data as IErrorResponse;
        console.error(`Query ${queryId} failed:`, errorResponse.error);
        setQueryStatus((prev) => ({
          ...prev,
          status: { ...prev.status, [queryId]: "error" },
          errorMessage: errorResponse.error,
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
                data.results.bindings[0].count.value
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
              (a, b) => b.length - a.length
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
        status: { ...prev.status, [queryId]: "success" },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error executing query";
      console.error(`Query ${queryId} failed:`, errorMessage);
      setQueryStatus((prev) => ({
        ...prev,
        status: { ...prev.status, [queryId]: "error" },
        errorMessage: errorMessage,
      }));
    }
  }, []);

  const executeAllQueries = useCallback(async () => {
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

    // Execute queries sequentially to avoid overwhelming the server
    for (const queryId of queries) {
      await executeQuery(queryId);
    }
  }, [executeQuery]);

  useEffect(() => {
    executeAllQueries();
  }, [executeAllQueries]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      // Always use UTC to ensure consistent rendering
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();

      const italianMonths = [
        "gennaio",
        "febbraio",
        "marzo",
        "aprile",
        "maggio",
        "giugno",
        "luglio",
        "agosto",
        "settembre",
        "ottobre",
        "novembre",
        "dicembre",
      ];

      return `${day} ${italianMonths[month]} ${year}`;
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          {queryStatus.status.dateRange === "loading"
            ? "Esecuzione query..."
            : queryStatus.status.dateRange === "error"
              ? "Database temporaneamente non disponibile"
              : results.dateRange
                ? `Articoli dal ${formatDate(results.dateRange.oldestDate)} al ${formatDate(results.dateRange.mostRecentDate)}`
                : "Statistiche"}
        </h1>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <MetricCard
            title="Articoli Totali"
            value={results.totalArticles}
            status={queryStatus.status.totalArticles}
          />
          <MetricCard
            title="Autori Unici"
            value={results.uniqueAuthors}
            status={queryStatus.status.uniqueAuthors}
          />
          <MetricCard
            title="Località Uniche"
            value={results.uniqueLocations}
            status={queryStatus.status.uniqueLocations}
          />
          <MetricCard
            title="Persone Totali"
            value={results.totalPeople}
            status={queryStatus.status.totalPeople}
          />
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Most Cited Authors */}
          <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Firme di articoli
              </h3>
              <div className="space-y-4">
                {queryStatus.status.topAuthors === "loading" ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="ml-auto h-4 bg-gray-200 rounded w-16" />
                      </div>
                    ))}
                  </div>
                ) : queryStatus.status.topAuthors === "error" ? (
                  <span className="text-gray-500">Dati non disponibili</span>
                ) : (
                  <div className="space-y-3">
                    {results.topAuthors?.map((item, index) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors animate-fadeIn delay-${index * 150}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}.
                          </span>
                          <span className="text-gray-700 font-medium truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-gray-500 tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Most Cited Locations */}
          <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Località più citate
              </h3>
              <div className="space-y-4">
                {queryStatus.status.topLocations === "loading" ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="ml-auto h-4 bg-gray-200 rounded w-16" />
                      </div>
                    ))}
                  </div>
                ) : queryStatus.status.topLocations === "error" ? (
                  <span className="text-gray-500">Dati non disponibili</span>
                ) : (
                  <div className="space-y-3">
                    {results.topLocations?.map((item, index) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors animate-fadeIn delay-${index * 150}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}.
                          </span>
                          <span className="text-gray-700 font-medium truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-gray-500 tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Most Cited People */}
          <div className="bg-white overflow-hidden shadow-lg rounded-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Persone più citate
              </h3>
              <div className="space-y-4">
                {queryStatus.status.topPeople === "loading" ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="ml-auto h-4 bg-gray-200 rounded w-16" />
                      </div>
                    ))}
                  </div>
                ) : queryStatus.status.topPeople === "error" ? (
                  <span className="text-gray-500">Dati non disponibili</span>
                ) : (
                  <div className="space-y-3">
                    {results.topPeople?.map((item, index) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors animate-fadeIn delay-${index * 150}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}.
                          </span>
                          <span className="text-gray-700 font-medium truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-gray-500 tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
