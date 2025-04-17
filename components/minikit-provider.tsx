"use client"

import { ReactNode, useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { worldAppConfig } from '@/lib/config'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      // Initialize MiniKit with the app ID from centralized config
      if (worldAppConfig.isInitialized()) {
        MiniKit.install(worldAppConfig.appId)
        console.log('MiniKit initialized with app ID')
      } else {
        console.warn('World App ID not found in environment variables')
        // Fall back to empty string instead of undefined
        MiniKit.install('')
      }
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize MiniKit:', error);
      // Don't throw error in production to prevent app from crashing
    }
  }, [])

  return <>{children}</>
} 