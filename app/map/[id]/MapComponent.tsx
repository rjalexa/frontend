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
  const mapInstanceRef = React.useRef<any>(null);
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
        
        // Get location from URL parameters
        const searchParams = new URLSearchParams(window.location.search);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');
        const locationName = searchParams.get('name') || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        // Create article data using the URL parameters
        setArticle({
          id: articleId as string,
          headline: "Location View",
          meta_data: [
            {
              id: "1",
              kind: "location",
              label: locationName,
              lat: lat,
              lng: lng
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
    // Don't initialize if any required conditions are not met
    if (!article) {
      console.log('No article data available yet');
      return;
    }
    
    if (!mapContainerRef.current) {
      console.log('Map container not available yet');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('Map already initialized');
      return;
    }

    let cleanupFunction: (() => void) | null = null;

    const initializeMap = async () => {
      setMapLoading(true);
      setMapError(null);

      try {
        console.log('Initializing map...');
        
        // Dynamic import of Leaflet
        const L = (await import('leaflet')).default;
        
        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');

        console.log('Leaflet loaded successfully');

        // Fix Leaflet's default icon path issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map instance
        console.log('Creating map instance...');
        const container = mapContainerRef.current;
        if (!container) {
          throw new Error('Map container not found');
        }
        
        mapInstanceRef.current = L.map(container, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView([46.2276, 2.2137], 6);
        
        // Add scale control
        L.control.scale().addTo(mapInstanceRef.current);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        console.log('Tile layer added');

        // Add markers if available
        if (article.meta_data) {
          const locations = article.meta_data.filter(
            entity => entity.kind === 'location' && 
            typeof entity.lat === 'number' && 
            typeof entity.lng === 'number'
          );

          console.log('Found locations:', locations);

          if (locations.length > 0) {
            const markers = locations.map(location => ({
              pos: [location.lat!, location.lng!] as [number, number],
              label: location.label
            }));

            // Get URL parameters for bounds
            const searchParams = new URLSearchParams(window.location.search);
            const north = parseFloat(searchParams.get('north') || '0');
            const south = parseFloat(searchParams.get('south') || '0');
            const east = parseFloat(searchParams.get('east') || '0');
            const west = parseFloat(searchParams.get('west') || '0');

            // Add markers
            markers.forEach(marker => {
              L.marker(marker.pos)
                .bindPopup(marker.label)
                .addTo(mapInstanceRef.current);
            });

            // If we have valid bounds parameters, use them
            if (north && south && east && west) {
              const bounds = L.latLngBounds(
                [north, west],
                [south, east]
              );
              mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
              console.log('Set bounds from URL parameters:', { north, south, east, west });
            } else {
              // Fallback to marker bounds
              const bounds = L.latLngBounds(markers.map(m => m.pos));
              mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
              console.log('Set bounds from markers');
            }
            console.log('Markers added and bounds set');
          }
        }

        // Setup cleanup function
        cleanupFunction = () => {
          if (mapInstanceRef.current) {
            console.log('Cleaning up map...');
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
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
      </div>
      {mapError ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">{mapError}</div>
        </div>
      ) : (
        <>
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="text-lg">Initializing map...</div>
            </div>
          )}
          <div ref={mapContainerRef} className="flex-1" />
        </>
      )}
    </div>
  );
};

export default MapComponent;