// app/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Articles</h1>
        
        <div className="grid grid-cols-1 gap-2">
          {articles.map(article => (
            <button
              key={article.id}
              onClick={() => router.push(`/article/${article.id}`)}
              className="text-left p-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              {article.headline}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
