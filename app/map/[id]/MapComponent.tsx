'use client';
import React from 'react';
import { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

function isLeafletMap(map: any): map is LeafletMap {
  return map && typeof map.remove === 'function';
}

interface LinkingInfo {
  lat?: number;
  lng?: number;
  title?: string;
  summary?: string;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface Entity {
  id: string;
  kind: string;
  label: string;
  linking_info?: LinkingInfo[];
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
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'single' | 'all'>('single');
  const [map, setMap] = React.useState<LeafletMap | null>(null);

  // Fetch article data
  React.useEffect(() => {
    let mounted = true;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check URL parameters to determine mode
        const searchParams = new URLSearchParams(window.location.search);
        const mode = searchParams.get('mode');
        setViewMode(mode === 'all' ? 'all' : 'single');
        
        const response = await fetch('/api/files');
        const articles: Article[] = await response.json();
        const foundArticle = articles.find(a => a.id === articleId);
        
        if (!foundArticle) {
          throw new Error('Article not found');
        }

        if (mounted) {
          setArticle(foundArticle);
        }
      } catch (error) {
        if (mounted) {
          setError('Failed to fetch article data');
          console.error('Error fetching article:', error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      mounted = false;
    };
  }, [articleId]);

  // Initialize map
  React.useEffect(() => {
    if (!mapContainerRef.current || !article || map) return;

    let mounted = true;
    
    const initializeMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix Leaflet's default icon path issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mounted || !mapContainerRef.current) return;

        const newMap = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(newMap);

        L.control.scale().addTo(newMap);

        if (viewMode === 'single') {
          const searchParams = new URLSearchParams(window.location.search);
          const lat = parseFloat(searchParams.get('lat') || '0');
          const lng = parseFloat(searchParams.get('lng') || '0');
          const name = searchParams.get('name') || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          const north = parseFloat(searchParams.get('north') || '0');
          const south = parseFloat(searchParams.get('south') || '0');
          const east = parseFloat(searchParams.get('east') || '0');
          const west = parseFloat(searchParams.get('west') || '0');

          if (lat && lng) {
            L.marker([lat, lng])
              .bindPopup(name)
              .addTo(newMap);

            if (north && south && east && west) {
              newMap.fitBounds([
                [north, west],
                [south, east]
              ], { padding: [50, 50] });
            } else {
              newMap.setView([lat, lng], 10);
            }
          }
        } else {
          const locations = article.meta_data
            ?.filter(entity => 
              entity.kind === 'location' && 
              entity.linking_info?.[1]?.lat && 
              entity.linking_info?.[1]?.lng
            )
            .map(entity => ({
              label: entity.label,
              lat: entity.linking_info![1].lat!,
              lng: entity.linking_info![1].lng!,
              summary: entity.linking_info![0]?.summary
            })) || [];

          if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
            
            locations.forEach(location => {
              L.marker([location.lat, location.lng])
                .bindPopup(`
                  <strong>${location.label}</strong>
                  ${location.summary ? `<br/><br/>${location.summary.split('.')[0]}.` : ''}
                `)
                .addTo(newMap);
            });

            newMap.fitBounds(bounds, { padding: [50, 50] });
          } else {
            newMap.setView([0, 0], 2);
          }
        }

        if (mounted) {
          setMap(newMap);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        if (mounted) {
          setError('Failed to initialize map');
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [article, viewMode, map]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (isLeafletMap(map)) {
        map.remove();
        setMap(null);
      }
    };
  }, [map]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading article data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
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
        {article && (
          <div className="mt-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {article.headline}
            </h1>
            <p className="text-sm text-gray-600">
              {viewMode === 'all' ? 'Showing all locations' : 'Showing selected location'}
            </p>
          </div>
        )}
      </div>
      <div ref={mapContainerRef} className="flex-1" />
    </div>
  );
};

export default MapComponent;
