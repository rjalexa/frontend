// File: /app/map/[id]/MapComponent.tsx
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
  const params = useParams(); // Use useParams to handle dynamic route params
  const articleId = React.use(params)?.id; // Ensure params are resolved properly

  const mapRef = React.useRef<any>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch article data
  React.useEffect(() => {
    if (!articleId) return; // Ensure articleId is available
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient) return;

    // Load OpenStreetMap and Leaflet only on client side
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    // Fix Leaflet's default icon path issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const map = L.map('map').setView([0, 0], 2);

    const mapLayers = {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }),
      'CartoDBPositron': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '© CartoDB',
      }),
    };

    mapLayers.CartoDBPositron.addTo(map);
    L.control.layers(mapLayers).addTo(map);

    // Add markers for all location entities
    if (article?.meta_data) {
      const locationEntities = article.meta_data.filter(
        entity => entity.kind === 'location' && entity.lat && entity.lng
      );

      if (locationEntities.length > 0) {
        const bounds = L.latLngBounds([]);

        locationEntities.forEach(location => {
          if (location.lat && location.lng) {
            const marker = L.marker([location.lat, location.lng])
              .bindPopup(location.label)
              .addTo(map);
            bounds.extend([location.lat, location.lng]);
          }
        });

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [article, isClient]);

  if (loading) return <div>Loading map...</div>;

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
      <div id="map" className="flex-1" />
    </div>
  );
};

export default MapComponent;
