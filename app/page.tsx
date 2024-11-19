// app/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  headline: string;
  meta_data?: Array<{
    id: string;
    kind: 'person' | 'location' | 'organization';
    label: string;
  }>;
}

export default function Home() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (loading) return <div className="p-4 text-gray-900">Loading...</div>;

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Articles</h1>
        
        <div className="grid grid-cols-1 gap-2">
          {articles.length > 0 ? (
            articles.map((article: Article) => (
              <button
                key={article.id}
                onClick={() => router.push(`/article/${article.id}`)}
                className="text-left p-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                {article.headline}
              </button>
            ))
          ) : (
            <p className="text-gray-600">No articles found.</p>
          )}
        </div>
      </div>
    </div>
  );
}