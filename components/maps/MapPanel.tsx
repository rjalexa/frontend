import React, { useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import type { Map as LeafletMap, MapOptions } from 'leaflet';
import type { Article } from '@/lib/types';
import 'leaflet/dist/leaflet.css';  // Import Leaflet CSS at component level

interface MapPanelProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
}

const MapPanel: React.FC<MapPanelProps> = ({
  isOpen,
  onClose,
  article
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  
  useEffect(() => {
    let leafletModule: typeof import('leaflet');

    const loadLeaflet = async () => {
      leafletModule = await import('leaflet');
      return leafletModule.default;
    };

    if (!isOpen || !mapRef.current) {
      // Cleanup when closing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }
    
    const initMap = async () => {
      try {
        const L = await loadLeaflet();

        // Fix Leaflet's default icon path issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const options: MapOptions = {
          zoomControl: true,
          scrollWheelZoom: true,
          preferCanvas: true
        };

        if (mapRef.current === null) return;

        // Clean up existing map instance if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Ensure the map container is properly sized
        mapRef.current.style.height = '400px';
        mapRef.current.style.width = '100%';

        const newMap = L.map(mapRef.current, options);
        mapInstanceRef.current = newMap;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(newMap);

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

        // Trigger a resize event after map initialization
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Initialize the map
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, article]);

  if (!isOpen) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8 relative transform transition-all duration-300 ease-in-out">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
      <div className="flex items-start gap-4">
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">Location Map</h3>
          {/* Use inline style to ensure map container has dimensions */}
          <div 
            ref={mapRef} 
            style={{ height: '400px', width: '100%' }}
            className="rounded-lg overflow-hidden shadow-inner bg-gray-100" 
          />
        </div>
      </div>
    </div>
  );
};

export default MapPanel;