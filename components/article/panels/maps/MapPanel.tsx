import type { Map as LeafletMap, TileLayer } from "leaflet";
import { Globe } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";


import type { Article } from "@/types/article";
import type { BasePanelProps } from "@/types/panel";
import { logger } from "@/utils/logger";

import "leaflet/dist/leaflet.css";

interface ILeafletElement extends HTMLDivElement {
  _leaflet_id?: number;
}

interface IMapPanelProps extends BasePanelProps {
  article: Article;
  setDesiredMapState?: (state: boolean) => void;
}

const MapPanel: React.FC<IMapPanelProps> = ({ isOpen, onClose, article, setDesiredMapState }) => {
  const mapRef = useRef<ILeafletElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const streetsLayerRef = useRef<TileLayer | null>(null);
  const satelliteLayerRef = useRef<TileLayer | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!isOpen || !mapRef.current) {
      // Cleanup function when not open or no ref
      return () => {
        setIsMapReady(false);
      };
    }

    const loadLeaflet = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        if (!mapRef.current) return;

        if (mapRef.current._leaflet_id) {
          logger.debug('Map instance already exists');
          return;
        }

        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          preferCanvas: true,
        });

        mapInstanceRef.current = map;

        // Set default icon paths
        const IconDefault = L.Icon.Default as unknown as {
          prototype: { _getIconUrl?: string };
        };
        delete IconDefault.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Create tile layers
        streetsLayerRef.current = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
          }
        );

        satelliteLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "© ESRI",
          }
        );

        // Add initial layer
        streetsLayerRef.current.addTo(map);

        // Function to switch layers safely
        const switchLayer = (targetLayer: TileLayer, otherLayer: TileLayer) => {
          if (!mapInstanceRef.current) return;
          
          try {
            // Only proceed if map instance exists and is valid
            if (mapInstanceRef.current.getContainer()) {
              // First add the new layer if it's not already there
              if (!mapInstanceRef.current.hasLayer(targetLayer)) {
                targetLayer.addTo(mapInstanceRef.current);
              }
              
              // Then remove the old layer if it exists and is different from target
              if (mapInstanceRef.current.hasLayer(otherLayer) && targetLayer !== otherLayer) {
                otherLayer.remove();
              }
            }
          } catch (error) {
            logger.debug('Error switching layers:', error);
          }
        };

        // Function to update layer based on map bounds
        const updateLayerBasedOnBounds = () => {
          if (!mapInstanceRef.current || !streetsLayerRef.current || !satelliteLayerRef.current) return;

          const bounds = mapInstanceRef.current.getBounds();
          const distance = bounds.getNorthWest().distanceTo(bounds.getSouthEast());
          
          if (distance > 500000) {
            switchLayer(satelliteLayerRef.current, streetsLayerRef.current);
          } else {
            switchLayer(streetsLayerRef.current, satelliteLayerRef.current);
          }
        };

        // Bind events
        map.on('moveend', updateLayerBasedOnBounds);
        map.on('zoomend', updateLayerBasedOnBounds);

        // Add manual layer toggle control
        const LayerControl = L.Control.extend({
          options: { position: "topright" },
          onAdd: function () {
            const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
            const button = L.DomUtil.create("a", "", container);
            
            const updateButton = () => {
              const isStreets = map.hasLayer(streetsLayerRef.current!);
              button.innerHTML = isStreets ? "🗺️" : "🛰️";
            };

            button.title = "Toggle Map Type";
            button.style.cssText = "width:30px;height:30px;line-height:30px;text-align:center;font-size:20px;cursor:pointer;background:white;";
            button.href = "#";
            updateButton();

            L.DomEvent.on(button, "click", function (e) {
              L.DomEvent.preventDefault(e);
              if (!mapInstanceRef.current || !streetsLayerRef.current || !satelliteLayerRef.current) return;
              
              if (mapInstanceRef.current.hasLayer(streetsLayerRef.current)) {
                switchLayer(satelliteLayerRef.current, streetsLayerRef.current);
              } else {
                switchLayer(streetsLayerRef.current, satelliteLayerRef.current);
              }
              updateButton();
            });

            return container;
          },
        });

        map.addControl(new LayerControl());

        // Handle locations
        const locations = (article.meta_data || [])
          .filter((entity) => {
            const geoInfo = entity.linking_info?.find((info) => info.source === "geonames");
            return entity.kind === "location" && geoInfo?.lat !== undefined && geoInfo?.lng !== undefined;
          })
          .map((entity) => {
            const geoInfo = entity.linking_info?.find((info) => info.source === "geonames");
            const wikiInfo = entity.linking_info?.find((info) => info.source === "wikipedia");
            if (!geoInfo?.lat || !geoInfo?.lng) return null;
            return {
              label: entity.label,
              lat: geoInfo.lat,
              lng: geoInfo.lng,
              summary: wikiInfo?.summary,
            };
          })
          .filter((loc): loc is NonNullable<typeof loc> => loc !== null);

        // Set initial view and markers
        if (locations.length > 0) {
          const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
          locations.forEach((location) => {
            L.marker([location.lat, location.lng])
              .bindPopup(`<strong>${location.label}</strong>${location.summary ? `<br/><br/>${location.summary.split(".")[0]}.` : ""}`)
              .addTo(map);
          });
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView([0, 0], 2);
        }

        // Calculate initial view distance and set appropriate layer
        const initialBounds = map.getBounds();
        const initialDistance = initialBounds.getNorthWest().distanceTo(initialBounds.getSouthEast());
        
        if (initialDistance > 500000) {
          switchLayer(satelliteLayerRef.current, streetsLayerRef.current);
        } else {
          switchLayer(streetsLayerRef.current, satelliteLayerRef.current);
        }

        // Set map ready state after initialization
        setIsMapReady(true);
      } catch (error) {
        logger.error("Error initializing map:", error);
      }
    };

    loadLeaflet();

    // Component cleanup on unmount or when isOpen changes
    // Capture the ref value
    const currentMapRef = mapRef.current;

    return () => {
      try {
        if (mapInstanceRef.current) {
          // Remove event listeners first
          mapInstanceRef.current.off();
          
          // Remove layers carefully
          if (streetsLayerRef.current) {
            try {
              streetsLayerRef.current.remove();
            } catch (e) {
              logger.debug('Error removing streets layer:', e);
            }
          }
          if (satelliteLayerRef.current) {
            try {
              satelliteLayerRef.current.remove();
            } catch (e) {
              logger.debug('Error removing satellite layer:', e);
            }
          }
          
          // Finally remove the map instance
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            logger.debug('Error removing map instance:', e);
          }
        }
      } catch (e) {
        logger.debug('Error in cleanup:', e);
      } finally {
        // Reset all refs
        mapInstanceRef.current = null;
        streetsLayerRef.current = null;
        satelliteLayerRef.current = null;
        if (currentMapRef) {
          currentMapRef._leaflet_id = undefined;
        }
        setIsMapReady(false);
      }
    };
  }, [isOpen, article]);

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (setDesiredMapState) setDesiredMapState(false);
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close panel"
          >
            ✕
          </button>
          <Image src="/mema.svg" alt="MeMa Logo" width={64} height={24} className="ml-6" />
        </div>
      </div>
      <div className="p-4">
        <div
          ref={mapRef}
          style={{ height: "400px" }}
          className="w-full rounded-lg overflow-hidden shadow-inner bg-gray-100"
        />
      </div>
    </div>
  );
};

export default MapPanel;
