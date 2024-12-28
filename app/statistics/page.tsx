// app/statistics/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import StatsCard from "@/components/statistics/StatsCard";
import ListStatsCard from "@/components/statistics/ListStatsCard";
import { QueryId } from "@/lib/sparql";
import { executeSparqlQuery } from "@/lib/sparql";

interface DateRange {
  oldestDate?: string;
  mostRecentDate?: string;
}

interface ListItem {
  label: string;
  value: number;
}

interface QueryResults {
  dateRange?: DateRange;
  totalArticles?: number;
  uniqueAuthors?: number;
  uniqueLocations?: number;
  totalPeople?: number;
  topAuthors?: ListItem[];
  topLocations?: ListItem[];
  topPeople?: ListItem[];
}

interface QueryStatus {
  [key: string]: "loading" | "success" | "error";
}

export default function StatisticsPage() {
  const [results, setResults] = useState<QueryResults>({});
  const [queryStatus, setQueryStatus] = useState<QueryStatus>({});

  const executeQuery = useCallback(async (queryId: QueryId) => {
    setQueryStatus((prev) => ({ ...prev, [queryId]: "loading" }));

    try {
      const data = await executeSparqlQuery(queryId);

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
            // Helper function to check if a name is a part of another name
            function isNameVariation(
              shortName: string,
              fullName: string
            ): boolean {
              // Split names into components (all parts start with capital letter)
              const shortParts = shortName.match(/[A-Z][a-z]+/g) || [];
              const fullParts = fullName.match(/[A-Z][a-z]+/g) || [];

              // If short name has more parts than full name, they can't match
              if (shortParts.length > fullParts.length) {
                return false;
              }

              // Check if all parts from short name exist in full name in the same order
              let fullIndex = 0;
              for (const shortPart of shortParts) {
                // Find this part in remaining full name parts
                while (
                  fullIndex < fullParts.length &&
                  fullParts[fullIndex] !== shortPart
                ) {
                  fullIndex++;
                }
                if (fullIndex >= fullParts.length) {
                  return false; // Part not found
                }
                fullIndex++; // Move to next position to maintain order
              }
              return true;
            }

            // First pass: collect all names and their counts
            const initialCounts = new Map<string, number>();
            data.results.bindings.forEach((binding) => {
              const name = binding.personLabel.value;
              const count = parseInt(binding.mentions_count.value);
              initialCounts.set(name, count);
            });

            // Second pass: find variations and aggregate
            const aggregatedCounts = new Map<string, number>();
            const processedNames = new Set<string>();

            // Process longer names first to prefer full names as canonical
            const sortedNames = Array.from(initialCounts.keys()).sort(
              (a, b) => b.length - a.length
            );

            for (const name of sortedNames) {
              if (processedNames.has(name)) continue;

              let totalCount = initialCounts.get(name) || 0;
              const variations: string[] = [name];

              // Look for shorter variations of this name
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

              // Use the shortest name as canonical unless it's just one word and we have a full version
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

            // Convert to array, sort by count, and take top 20
            newResults.topPeople = Array.from(aggregatedCounts)
              .map(([label, value]) => ({ label, value }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 20);

            console.log(
              "People count aggregation:",
              Array.from(aggregatedCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => `${name}: ${count}`)
                .join("\n")
            );

            break;
          }
        }

        return newResults;
      });

      setQueryStatus((prev) => ({ ...prev, [queryId]: "success" }));
    } catch (error) {
      console.error(`Query ${queryId} failed:`, error);
      setQueryStatus((prev) => ({ ...prev, [queryId]: "error" }));
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {queryStatus.dateRange === "loading"
          ? "Esecuzione query..."
          : queryStatus.dateRange === "error"
          ? "Query fallita..."
          : results.dateRange
          ? `Articoli dal ${formatDate(
              results.dateRange.oldestDate
            )} al ${formatDate(results.dateRange.mostRecentDate)}`
          : "Statistiche"}
      </h1>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Articoli Totali"
            value={results.totalArticles}
            isLoading={queryStatus.totalArticles === "loading"}
            hasError={queryStatus.totalArticles === "error"}
          />
          <StatsCard
            title="Autori Unici"
            value={results.uniqueAuthors}
            isLoading={queryStatus.uniqueAuthors === "loading"}
            hasError={queryStatus.uniqueAuthors === "error"}
          />
          <StatsCard
            title="Località Uniche"
            value={results.uniqueLocations}
            isLoading={queryStatus.uniqueLocations === "loading"}
            hasError={queryStatus.uniqueLocations === "error"}
          />
          <StatsCard
            title="Persone Totali"
            value={results.totalPeople}
            isLoading={queryStatus.totalPeople === "loading"}
            hasError={queryStatus.totalPeople === "error"}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ListStatsCard
            title="Autori più citati"
            items={results.topAuthors}
            isLoading={queryStatus.topAuthors === "loading"}
            hasError={queryStatus.topAuthors === "error"}
          />
          <ListStatsCard
            title="Località più citate"
            items={results.topLocations}
            isLoading={queryStatus.topLocations === "loading"}
            hasError={queryStatus.topLocations === "error"}
          />
          <ListStatsCard
            title="Persone più citate"
            items={results.topPeople}
            isLoading={queryStatus.topPeople === "loading"}
            hasError={queryStatus.topPeople === "error"}
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
