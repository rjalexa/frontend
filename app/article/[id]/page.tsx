'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, User, Building, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Entity {
 id: string;
 kind: 'person' | 'location' | 'organization';
 label: string;
 summary?: string;
 coordinates?: string;
}

interface Article {
 id: string;
 headline: string;
 meta_data?: Entity[];
}

interface PageProps {
 params: Promise<{ id: string }>;
}

export default function ArticlePage({ params }: PageProps) {
 const router = useRouter();
 const [article, setArticle] = useState<Article | null>(null);
 const [selectedType, setSelectedType] = useState<'all' | 'person' | 'location' | 'organization'>('all');
 const [loading, setLoading] = useState(true);

 const articleId = React.use(params).id;

 useEffect(() => {
   const fetchArticle = async () => {
     try {
       const response = await fetch('/api/files');
       const articles: Article[] = await response.json();
       const found = articles.find((a: Article) => a.id === articleId);
       setArticle(found || null);
     } catch (error) {
       console.error('Error:', error);
     } finally {
       setLoading(false);
     }
   };
   fetchArticle();
 }, [articleId]);

  const getIcon = (kind: Entity['kind']) => {
    switch(kind) {
      case 'location':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'person':
        return <User className="w-5 h-5 text-green-500" />;
      case 'organization':
        return <Building className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const filterEntities = (): Entity[] => {
    if (!article?.meta_data) return [];
    if (selectedType === 'all') return article.meta_data;
    return article.meta_data.filter(entity => entity.kind === selectedType);
  };

  if (loading) return <div className="p-4 text-black">Loading...</div>;
  if (!article) return <div className="p-4 text-black">Article not found</div>;

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </button>

        <h1 className="text-2xl font-bold mb-4 text-gray-900">{article.headline}</h1>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded transition-colors ${
              selectedType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('person')}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedType === 'person' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4" /> People
          </button>
          <button
            onClick={() => setSelectedType('location')}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedType === 'location' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" /> Locations
          </button>
          <button
            onClick={() => setSelectedType('organization')}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedType === 'organization' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <Building className="w-4 h-4" /> Organizations
          </button>
        </div>

        {article.meta_data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterEntities().map((entity) => (
              <Card key={entity.id} className="hover:shadow-lg transition-shadow bg-white border-gray-200">
                <CardHeader className="flex flex-row items-center gap-2">
                  {getIcon(entity.kind)}
                  <CardTitle className="text-lg text-gray-900">{entity.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {entity.summary && <p className="text-gray-700">{entity.summary}</p>}
                  {entity.coordinates && (
                    <p className="text-gray-600 mt-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {entity.coordinates}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-700">No entity data available for this article</div>
        )}
      </div>
    </div>
  );
}