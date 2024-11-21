// app/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, MoreVertical, FileText, Map } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Article {
  id: string;
  headline: string;
  date_created: string;
  author: string;
  meta_data?: Array<{
    id: string;
    kind: 'person' | 'location' | 'organization';
    label: string;
  }>;
}

type SortField = 'date_created' | 'headline' | 'author';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date_created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/files');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'date_created') {
      return direction * (new Date(a.date_created).getTime() - new Date(b.date_created).getTime());
    }
    
    const aValue = a[sortField].toLowerCase();
    const bValue = b[sortField].toLowerCase();
    return direction * aValue.localeCompare(bValue);
  });

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (loading) return <div className="p-4 text-gray-900">Loading...</div>;

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Articles</h1>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 px-4 text-left font-medium">
                  <button 
                    onClick={() => handleSort('headline')}
                    className="flex items-center gap-1 hover:text-gray-600"
                  >
                    Title
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="py-2 px-4 text-left">
                  <button 
                    onClick={() => handleSort('date_created')}
                    className="flex items-center gap-1 hover:text-gray-600"
                  >
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="py-2 px-4 text-left">
                  <button 
                    onClick={() => handleSort('author')}
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
                  <tr
                    key={article.id}
                    className="border-b hover:bg-gray-100"
                  >
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
                      {article.date_created.slice(0, 10)}
                    </td>
                    <td 
                      className="py-2 px-4 cursor-pointer"
                      onClick={() => router.push(`/article/${article.id}`)}
                    >
                      {article.author}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/article/${article.id}`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Article
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/map/${article.id}?mode=all`)}>
                            <Map className="h-4 w-4 mr-2" />
                            View Map
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
    </div>
  );
}
