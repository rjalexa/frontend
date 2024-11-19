// File: /app/map/[id]/MapComponent.tsx
'use client'
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

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

interface MapProps {
  params: {
    id: string;
  };
}

const MapComponent = ({ params }: MapProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = React.useRef<any>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch article data
  React.useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`);
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
  }, [params.id]);

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

    // Only parse lat/lng if both are provided in URL
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const hasMarker = latParam !== null && lngParam !== null;
    const lat = hasMarker ? parseFloat(latParam) : 0;
    const lng = hasMarker ? parseFloat(lngParam) : 0;

    // Check if we have all bbox coordinates
    const hasBbox = searchParams.has('north') && searchParams.has('south') && 
                   searchParams.has('east') && searchParams.has('west');
    
    let bboxNorth, bboxSouth, bboxEast, bboxWest;
    if (hasBbox) {
      bboxNorth = parseFloat(searchParams.get('north') || '0');
      bboxSouth = parseFloat(searchParams.get('south') || '0');
      bboxEast = parseFloat(searchParams.get('east') || '0');
      bboxWest = parseFloat(searchParams.get('west') || '0');
    }

    // Create map with a default view
    const map = L.map('map').setView([0, 0], 2);

    // Define different map styles
    const mapLayers = {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }),
      'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap contributors'
      }),
      'WorldImagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      }),
      'CartoDBPositron': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '© CartoDB'
      }),
      'CartoDBVoyager': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        attribution: '© CartoDB'
      })
    };

    // Add default layer
    mapLayers.CartoDBPositron.addTo(map);

    // Add layer control
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

        // Fit map to show all markers
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }

    // Only draw bounding box if bbox coordinates are provided
    if (hasBbox) {
      // Adjust longitudes if bounding box crosses the antimeridian
      if (bboxWest > bboxEast) {
        // Crosses the antimeridian
        bboxEast += 360;
      }

      // Function to adjust longitudes for polygon coordinates
      const adjustLng = (lng) => {
        if (lng < bboxWest) {
          return lng + 360;
        }
        return lng;
      };

      // Create polygon coordinates
      const coordinates = [
        [
          [adjustLng(bboxWest), bboxNorth],
          [adjustLng(bboxWest), bboxSouth],
          [adjustLng(bboxEast), bboxSouth],
          [adjustLng(bboxEast), bboxNorth],
          [adjustLng(bboxWest), bboxNorth]
        ]
      ];

      // Create GeoJSON polygon
      const polygonGeoJSON = {
        "type": "Polygon",
        "coordinates": coordinates
      };

      // Add polygon to the map
      const polygon = L.geoJSON(polygonGeoJSON, {
        style: {
          color: "#ff7800",
          weight: 1,
          fillOpacity: 0.2
        }
      }).addTo(map);

      // Adjust map view to fit the polygon
      map.fitBounds(polygon.getBounds());
    }

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [searchParams, isClient]);

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
