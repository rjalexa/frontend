// app/statistics/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

import ListCard from "@/components/statistics/ListCard";
import MetricCard from "@/components/statistics/MetricCard";
import { QueryId, executeSparqlQuery } from "@/lib/sparql";
import {
  IQueryResults,
  IQueryStatus,
  IErrorResponse,
} from "@components/statistics/types";

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

    // Set all queries to loading state immediately
    setQueryStatus((prev) => ({
      ...prev,
      status: queries.reduce(
        (acc, queryId) => ({
          ...acc,
          [queryId]: "loading",
        }),
        {},
      ),
    }));

    // Execute all queries in parallel but with a small delay between starts
    const promises = queries.map(
      (queryId, index) =>
        new Promise<void>((resolve) => {
          setTimeout(async () => {
            try {
              await executeQuery(queryId);
            } finally {
              resolve();
            }
          }, index * 100); // 100ms delay between each query start
        }),
    );

    await Promise.all(promises);
  }, [executeQuery]);

  useEffect(() => {
    executeAllQueries();
  }, [executeAllQueries]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

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
          <ListCard
            title="Firme di articoli"
            items={results.topAuthors}
            status={queryStatus.status.topAuthors}
          />
          <ListCard
            title="Località più citate"
            items={results.topLocations}
            status={queryStatus.status.topLocations}
          />
          <ListCard
            title="Persone più citate"
            items={results.topPeople}
            status={queryStatus.status.topPeople}
          />
        </div>
      </div>
    </div>
  );
}
