'use client'

import dynamic from 'next/dynamic'

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

export default function MapView({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen w-full">
      <MapComponent params={params} />
    </div>
  )
}
