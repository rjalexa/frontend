'use client';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Entity {
  id: string;
  kind: string;
  label: string;
  lat?: number;
  lng?: number;
}

interface Article {
  id: string;
  headline: string;
  meta_data?: Entity[];
}

const MapComponent = () => {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id;

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mapLoading, setMapLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);

  // Fetch article data
  React.useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call but use mock data for now
        setArticle({
          id: articleId as string,
          headline: "Sample Article",
          meta_data: [
            {
              id: "1",
              kind: "location",
              label: "Paris",
              lat: 48.8566,
              lng: 2.3522
            },
            {
              id: "2",
              kind: "location",
              label: "Lyon",
              lat: 45.7578,
              lng: 4.8320
            }
          ]
        });
      } catch (error) {
        setError('Failed to fetch article data');
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // Handle map initialization
  React.useEffect(() => {
    let map: L.Map | null = null;
    let cleanupFunction: (() => void) | null = null;

    const initializeMap = async () => {
      setMapLoading(true);
      setMapError(null);
      if (!mapContainerRef.current || !article) return;

      try {
        // Dynamic import of Leaflet
        const L = (await import('leaflet')).default;
        require('leaflet/dist/leaflet.css');

        // Fix Leaflet's default icon path issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map instance
        map = L.map(mapContainerRef.current).setView([46.2276, 2.2137], 6);

        // Add tile layer
        if (map) {
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '© CartoDB'
          }).addTo(map);
        }

        // Add markers if available
        if (article.meta_data) {
          const locations = article.meta_data.filter(
            entity => entity.kind === 'location' && 
            typeof entity.lat === 'number' && 
            typeof entity.lng === 'number'
          );

          if (locations.length > 0) {
            const markers = locations.map(location => ({
              pos: [location.lat!, location.lng!] as [number, number],
              label: location.label
            }));

            // Add markers and collect bounds
            const bounds = L.latLngBounds(markers.map(m => m.pos));
            
            markers.forEach(marker => {
              if (map) {
                L.marker(marker.pos)
                  .bindPopup(marker.label)
                  .addTo(map);
              }
            });

            // Fit bounds with padding
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }

        // Setup cleanup function
        cleanupFunction = () => {
          if (map) {
            map.remove();
            map = null;
          }
        };

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      } finally {
        setMapLoading(false);
      }
    };

    // Initialize map
    initializeMap();

    // Cleanup
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [article]); // Only reinitialize when article changes

  if (loading || mapLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">
          {loading ? 'Loading article data...' : 'Initializing map...'}
        </div>
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-600">{error || mapError}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-white shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Article
        </button>
      </div>
      <div ref={mapContainerRef} className="flex-1" />
    </div>
  );
};

export default MapComponent;
