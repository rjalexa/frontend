// frontend/app/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Menu } from "lucide-react";
import Header from '@/components/Header';
import { HighlightsPanel } from '@/components/highlights/HighlightsPanel';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
});

interface Article {
  id: string;
  headline: string;
  date_created: string;
  author: string;
  datePublished: string; // Added for highlights
  slug: string; // Added for highlights
  meta_data?: Array<{
    id: string;
    kind: "person" | "location" | "organization";
    label: string;
  }>;
}

type SortField = "date_created" | "headline" | "author";
type SortDirection = "asc" | "desc";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date_created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Handle hydration
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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleViewHighlights = (article: Article) => {
    setSelectedArticle(article);
    setHighlightsOpen(true);
  };

  const handleCloseHighlights = () => {
    setHighlightsOpen(false);
    setSelectedArticle(null);
    // Force a re-render of the page
    setTimeout(() => {
      document.body.style.pointerEvents = "auto";
      document.body.style.overflow = "auto";
    }, 0);
  };

  const sortedArticles = [...articles].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortField === "date_created") {
      return (
        direction *
        (new Date(a.date_created).getTime() -
          new Date(b.date_created).getTime())
      );
    }

    const aValue = a[sortField].toLowerCase();
    const bValue = b[sortField].toLowerCase();
    return direction * aValue.localeCompare(bValue);
  });

  // Don't render anything until after hydration
  if (!mounted) return null;

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (loading) return <div className="p-4 text-gray-900">Loading...</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="w-full">
        {/* Header container */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            {/* Menu button on the left */}
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
  
            {/* Logo in the center */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-600">quotidiano comunista</div>
              <div className={`${playfair.className} text-4xl`}>il manifesto</div>
            </div>
  
            {/* User icon on the right */}
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Bottom border */}
        <div className="w-full border-b border-gray-200" />
        
        {/* Red bar */}
        <div className="w-full h-2 bg-red-600" />
      </div>
  
      {/* Main content */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Articles</h1>
  
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-4 text-left font-medium">
                    <button
                      onClick={() => handleSort("headline")}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      Title
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-2 px-4 text-left w-36">
                    <button
                      onClick={() => handleSort("date_created")}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="py-2 px-4 text-left">
                    <button
                      onClick={() => handleSort("author")}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      Author
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
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
                        {article.headline}
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-600">
                      No articles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
  
        {selectedArticle && (
          <HighlightsPanel
            isOpen={highlightsOpen}
            onClose={handleCloseHighlights}
            articleTitle={selectedArticle.headline}
            datePublished={selectedArticle.datePublished}
            slug={selectedArticle.slug}
          />
        )}
      </div>
    </div>
  );
}
