"use client"

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize MiniKit with the app ID from environment variables
    const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID
    if (appId) {
      MiniKit.install(appId)
      console.log('MiniKit initialized with app ID:', appId)
    } else {
      console.warn('World App ID not found in environment variables')
      MiniKit.install()
    }
  }, [])

  return <>{children}</>
} 