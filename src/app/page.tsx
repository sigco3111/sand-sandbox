'use client'

import dynamic from 'next/dynamic'
const SandSimApp = dynamic(() => import('@/components/SandSimApp'), { ssr: false })

export default function Home() {
  return <SandSimApp />
}
