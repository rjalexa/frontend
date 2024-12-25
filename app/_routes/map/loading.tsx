// app/map/loading.tsx
import Image from 'next/image';
import { Globe } from 'lucide-react';

export default function MapLoading() {
  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <Globe className="w-4 h-4" />
          <span>Mappa</span>
        </div>
        <Image 
          src="/mema.svg" 
          alt="MeMa Logo" 
          width={64} 
          height={24} 
          className="ml-6"
          priority
        />
      </div>
      <div className="p-4">
        <div 
          className="w-full h-[400px] rounded-lg overflow-hidden shadow-inner bg-gray-100 animate-pulse flex items-center justify-center text-gray-500"
        >
          Loading map...
        </div>
      </div>
    </div>
  );
}
