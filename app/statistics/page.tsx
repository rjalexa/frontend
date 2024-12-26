// app/statistics/page.tsx
'use client'
import Image from 'next/image'
import { Cog } from 'lucide-react'

export default function StatisticsPage() {
  return (
    <div className="min-h-[calc(100vh-176px)] flex flex-col items-center justify-center gap-8 bg-white">
      <Image 
        src="/mema.svg" 
        alt="MeMa Logo" 
        width={128} 
        height={48}
        priority
      />
      <div className="flex items-center gap-3 text-gray-600">
        <Cog className="w-6 h-6 animate-spin" />
        <span className="text-xl">In costruzione...</span>
      </div>
    </div>
  )
}