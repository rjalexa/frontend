// File: /app/map/[id]/page.tsx
'use client'
import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Create a NoSSR wrapper component with proper typing
const NoSSR = ({ children }: { children: ReactNode }) => <>{children}</>;

// Define the props interface for MapComponent
interface MapProps {
  params: {
    id: string;
  };
}

// Create the client-side only Map component with proper typing
const MapComponent = dynamic<MapProps>(() => import('@/app/map/[id]/MapComponent').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100" />
});

// Main page component
export default function MapView({ params }: MapProps) {
  return (
    <NoSSR>
      <MapComponent params={params} />
    </NoSSR>
  );
}