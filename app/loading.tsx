// app/loading.tsx
import Image from 'next/image';
import { Globe } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <Image 
        src="/mema.svg" 
        alt="MeMa Logo" 
        width={128} 
        height={48} 
        className="animate-pulse"
        priority
      />
      <div className="text-blue-700 text-lg">Loading...</div>
    </div>
  );
}