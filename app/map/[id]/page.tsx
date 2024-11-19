'use client'
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MapView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    // Load OpenStreetMap and Leaflet only on client side
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    // Get geographic coordinates from bbox
    const bboxNorth = parseFloat(searchParams.get('north') || '0');
    const bboxSouth = parseFloat(searchParams.get('south') || '0');
    let bboxEast = parseFloat(searchParams.get('east') || '0');
    let bboxWest = parseFloat(searchParams.get('west') || '0');

    // Create map centered on the location
    const map = L.map('map').setView([lat, lng], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker for the specific location
    L.marker([lat, lng]).addTo(map);

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

    return () => {
      map.remove();
    };
  }, [searchParams]);

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
      <div id="map" className="flex-1"></div>
    </div>
  );
}
