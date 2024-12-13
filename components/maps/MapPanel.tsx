import React, { useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import type { Map as LeafletMap, MapOptions, TileLayer, LeafletEvent } from 'leaflet';
import type { Article } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

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
  const layersRef = useRef<{streets?: TileLayer, satellite?: TileLayer}>({});
  
  useEffect(() => {
    const loadLeaflet = async () => {
      const leafletModule = await import('leaflet');
      return leafletModule;
    };

    if (!isOpen || !mapRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }
    
    const initMap = async () => {
      try {
        const L = await loadLeaflet();

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

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        mapRef.current.style.height = '400px';
        mapRef.current.style.width = '100%';

        const newMap = L.map(mapRef.current, options);
        mapInstanceRef.current = newMap;

        // Create both tile layers
        const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© ESRI'
        });

        // Store layers for later use
        layersRef.current = {
          streets: streetsLayer,
          satellite: satelliteLayer
        };

        // Add streets layer by default
        streetsLayer.addTo(newMap);

        // Add layer control button
        const LayerControl = L.Control.extend({
          options: {
            position: 'topright'
          },

          onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('a', '', container);
            button.innerHTML = '🗺️';
            button.title = 'Change Map Type';
            button.style.width = '30px';
            button.style.height = '30px';
            button.style.lineHeight = '30px';
            button.style.textAlign = 'center';
            button.style.fontSize = '20px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = 'white';
            button.href = '#';

            let isStreets = true;
            
            L.DomEvent.on(button, 'click', function(e: Event) {
              L.DomEvent.preventDefault(e);
              if (isStreets) {
                newMap.removeLayer(streetsLayer);
                satelliteLayer.addTo(newMap);
                button.innerHTML = '🛰️';
              } else {
                newMap.removeLayer(satelliteLayer);
                streetsLayer.addTo(newMap);
                button.innerHTML = '🗺️';
              }
              isStreets = !isStreets;
            });

            return container;
          }
        });

        newMap.addControl(new LayerControl());

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

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

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
          <div className="flex justify-center">
            <div 
              ref={mapRef} 
              style={{ height: '400px', width: '100%', maxWidth: '800px' }}
              className="rounded-lg overflow-hidden shadow-inner bg-gray-100" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;