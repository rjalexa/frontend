// app/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Eye } from "lucide-react";
import type { Article } from '@/types/article';

type SortField = "date_created" | "title" | "author";
type SortDirection = "asc" | "desc";

const columnMappings = {
  "Titolo": "headline",
  "Data": "date_created",
  "Autore": "author"
} as const;

type DisplayName = keyof typeof columnMappings;

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window === 'undefined') return "date_created";
    const params = new URLSearchParams(window.location.search);
    const fieldParam = params.get('sortField');
    return (fieldParam as SortField) || localStorage.getItem('sortField') as SortField || "date_created";
  });
  
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window === 'undefined') return "desc";
    const params = new URLSearchParams(window.location.search);
    const directionParam = params.get('sortDirection');
    return (directionParam as SortDirection) || localStorage.getItem('sortDirection') as SortDirection || "desc";
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/files");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArticles(data || []);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchArticles();
    }
  }, [mounted]);

  const handleSort = (displayName: DisplayName) => {
    const field = columnMappings[displayName] as SortField;
    if (field === sortField) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
      localStorage.setItem('sortDirection', newDirection);
    } else {
      setSortField(field);
      setSortDirection("desc");
      localStorage.setItem('sortField', field);
      localStorage.setItem('sortDirection', "desc");
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
  
    if (sortField === "date_created") {
      return (
        direction *
        (new Date(a.date_created).getTime() - new Date(b.date_created).getTime())
      );
    }
  
    const aValue = (a[sortField] || '').toLowerCase();
    const bValue = (b[sortField] || '').toLowerCase();
    return direction * aValue.localeCompare(bValue);
  });

  if (!mounted) return null;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (loading) return <div className="p-4 text-gray-900">Loading...</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Articoli selezionati</h1>
  
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-4 text-left">
                    <button
                      onClick={() => handleSort("Titolo")}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      Titolo
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-2 px-4 text-left w-36">
                    <button
                      onClick={() => handleSort("Data")}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      Data
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-2 px-4 text-left">
                    <button
                      onClick={() => handleSort("Autore")}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      Autore
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-2 px-4 text-center w-20">
                    Dettagli
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedArticles.length > 0 ? (
                  sortedArticles.map((article: Article) => (
                    <tr key={article.id} className="border-b hover:bg-gray-100">
                      <td
                        className="py-2 px-4 cursor-pointer"
                        onClick={() => router.push(`/article/${article.id}`)}
                      >
                        {article.title}
                      </td>
                      <td
                        className="py-2 px-4 cursor-pointer"
                        onClick={() => router.push(`/article/${article.id}`)}
                      >
                        {mounted ? article.date_created.slice(0, 10) : ""}
                      </td>
                      <td
                        className="py-2 px-4 cursor-pointer"
                        onClick={() => router.push(`/article/${article.id}`)}
                      >
                        {article.author}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {article.highlights && article.highlights.length > 0 && (
                          <button
                            onClick={() => router.push(`/article/${article.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Highlights"
                          >
                            <Eye className="h-4 w-4 mx-auto" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-600">
                      No articles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}