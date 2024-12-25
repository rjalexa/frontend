import Image from 'next/image';

export default function RootLoading() {
  return (
    <div className="min-h-[calc(100vh-176px)] flex flex-col items-center justify-center gap-4 bg-white">
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
