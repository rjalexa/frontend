// components/EntityDashboard.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, User, Building } from 'lucide-react';

const EntityDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/files');
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const getIcon = (kind) => {
    switch(kind) {
      case 'location':
        return <MapPin className="w-5 h-5" />;
      case 'person':
        return <User className="w-5 h-5" />;
      case 'organization':
        return <Building className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const filterEntities = () => {
    if (!selectedArticle?.meta_data) return [];
    if (selectedType === 'all') return selectedArticle.meta_data;
    return selectedArticle.meta_data.filter(entity => entity.kind === selectedType);
  };

  return (
    <div className="p-4 bg-white">
      <div className="mb-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Articles</h2>
        
        {loading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        
        {!loading && !error && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 mb-6">
              {articles.map(article => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`text-left p-4 rounded ${
                    selectedArticle?.id === article.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {article.headline}
                </button>
              ))}
            </div>

            {selectedArticle && (
              <>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`px-4 py-2 rounded ${selectedType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedType('person')}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${selectedType === 'person' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    <User className="w-4 h-4" /> People
                  </button>
                  <button
                    onClick={() => setSelectedType('location')}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${selectedType === 'location' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    <MapPin className="w-4 h-4" /> Locations
                  </button>
                  <button
                    onClick={() => setSelectedType('organization')}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${selectedType === 'organization' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    <Building className="w-4 h-4" /> Organizations
                  </button>
                </div>

                {selectedArticle.meta_data ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterEntities().map((entity) => (
                      <Card key={entity.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-2">
                          {getIcon(entity.kind)}
                          <CardTitle className="text-lg">{entity.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {entity.summary && <p className="text-gray-600">{entity.summary}</p>}
                          {entity.coordinates && (
                            <p className="text-gray-500 mt-2">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              {entity.coordinates}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600">No entity data available for this article</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityDashboard;
