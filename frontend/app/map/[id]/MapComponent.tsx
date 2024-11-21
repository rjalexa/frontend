'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Entity {
  id: string;
  kind: 'person' | 'location' | 'organization';
  label: string;
}

interface Article {
  id: string;
  headline: string;
  meta_data?: Entity[];
}

interface MapProps {
  params: {
    id: string;
  };
}

export default function MapComponent({ params }: MapProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // For demo purposes, create mock data since API endpoint isn't available
        setArticle({
          id: params.id,
          headline: "Sample Article",
          meta_data: [
            {
              id: "1",
              kind: "location",
              label: "Selected Location",
              lat: parseFloat(new URLSearchParams(window.location.search).get('lat') || "0"),
              lng: parseFloat(new URLSearchParams(window.location.search).get('lng') || "0")
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  if (loading) return <div className="p-4">Loading map data...</div>;
  if (!article) return <div className="p-4">Article not found</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => router.push(`/article/${params.id}`)}
        className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Article
      </button>
      
      <h1 className="text-2xl font-bold mb-4">{article.headline}</h1>
      
      {/* Map implementation will go here */}
      <div className="w-full h-[600px] bg-gray-100 rounded-lg">
        <p className="p-4">Map visualization will be implemented here</p>
      </div>
    </div>
  );
}
