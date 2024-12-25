'use client'
import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Create a NoSSR wrapper component with proper typing
const NoSSR = ({ children }: { children: ReactNode }) => <>{children}</>;

// Define the props interface for the MapComponent
interface MapComponentProps {
  id: string;
}

// Create the client-side only Map component with proper typing
const MapComponent = dynamic<MapComponentProps>(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100" />
});

// Main page component with Next.js page props typing
export default function MapPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <NoSSR>
      <MapComponent id={params.id} />
    </NoSSR>
  );
}