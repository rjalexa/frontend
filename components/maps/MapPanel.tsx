import React, { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import type { Map as LeafletMap, MapOptions, TileLayer } from 'leaflet';
import type { Article, Entity, EntityKind, WikipediaLinkingInfo, GeonamesLinkingInfo } from '@/lib/types';
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
  const [isMapReady, setIsMapReady] = useState(false);
  
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const loadLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Set default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Clean up existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Create new map instance
        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          preferCanvas: true
        });

        mapInstanceRef.current = map;

        // Create tile layers
        const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© ESRI'
        });

        // Add streets layer by default
        streetsLayer.addTo(map);

        // Add layer control
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
                map.removeLayer(streetsLayer);
                satelliteLayer.addTo(map);
                button.innerHTML = '🛰️';
              } else {
                map.removeLayer(satelliteLayer);
                streetsLayer.addTo(map);
                button.innerHTML = '🗺️';
              }
              isStreets = !isStreets;
            });

            return container;
          }
        });

        map.addControl(new LayerControl());

        // Type guards for linking info
        const isGeonamesInfo = (info: any): info is GeonamesLinkingInfo => {
          return info?.source === "geonames";
        };

        const isWikipediaInfo = (info: any): info is WikipediaLinkingInfo => {
          return info?.source === "wikipedia";
        };

        // Extract locations data
        const locations = article.meta_data
          ?.filter(entity => {
            const geonamesInfo = entity.linking_info?.find(isGeonamesInfo);
            return entity.kind === 'location' && geonamesInfo?.lat !== undefined && geonamesInfo?.lng !== undefined;
          })
          .map(entity => {
            const geonamesInfo = entity.linking_info?.find(isGeonamesInfo);
            const wikipediaInfo = entity.linking_info?.find(isWikipediaInfo);
            
            if (!geonamesInfo) {
              return null;
            }

            return {
              label: entity.label,
              lat: geonamesInfo.lat,
              lng: geonamesInfo.lng,
              summary: wikipediaInfo?.summary
            };
          })
          .filter((location): location is NonNullable<typeof location> => location !== null) || [];

        // Add markers and set bounds
        if (locations.length > 0) {
          const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
          
          locations.forEach(location => {
            L.marker([location.lat, location.lng])
              .bindPopup(`
                <strong>${location.label}</strong>
                ${location.summary ? `<br/><br/>${location.summary.split('.')[0]}.` : ''}
              `)
              .addTo(map);
          });

          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView([0, 0], 2);
        }

        // Mark map as ready and trigger a resize
        setIsMapReady(true);
        map.invalidateSize();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setIsMapReady(false);
    };
  }, [isOpen, article]);

  // Effect to handle map resize when ready
  useEffect(() => {
    if (isMapReady && mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [isMapReady]);

  if (!isOpen) return null;

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <Globe className="w-4 h-4" />
          <span>Mappa</span>
        </div>
        <img src="/mema.svg" alt="MeMa Logo" className="w-16 h-6 ml-6" />
      </div>
      <div className="p-4">
        <div 
          ref={mapRef} 
          style={{ height: '400px' }}
          className="w-full rounded-lg overflow-hidden shadow-inner bg-gray-100" 
        />
      </div>
    </div>
  );
};

export default MapPanel;