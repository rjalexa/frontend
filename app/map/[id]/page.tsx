// File: /app/map/[id]/page.tsx
'use client'
import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Create a NoSSR wrapper component with proper typing
const NoSSR = ({ children }: { children: ReactNode }) => <>{children}</>;

// Define the props interface for MapComponent
interface MapComponentProps {
  params: {
    id: string;
  }
}

// Create the client-side only Map component with proper typing
const MapComponent = dynamic<MapComponentProps>(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100" />
});

// Main page component
export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  
  return (
    <NoSSR>
      <MapComponent params={{ id: resolvedParams.id }} />
    </NoSSR>
  );
}
