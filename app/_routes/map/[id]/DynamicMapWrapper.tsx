// app/map/[id]/components/DynamicMapWrapper.tsx
'use client'
import { type ReactNode } from 'react'
import dynamic from 'next/dynamic'

const NoSSR = ({ children }: { children: ReactNode }) => <>{children}</>

const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100" />
})

export default function DynamicMapWrapper() {
  return (
    <NoSSR>
      <DynamicMap />
    </NoSSR>
  )
}

