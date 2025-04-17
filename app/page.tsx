"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SplashScreen from "@/components/splash-screen"
import AuthScreen from "@/components/auth-screen"
import { isSupabaseInitialized } from "@/lib/supabase"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [hasError, setHasError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if critical dependencies are available
    if (!isSupabaseInitialized()) {
      console.error("Supabase is not initialized properly - missing environment variables")
      setHasError(true)
    }

    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (hasError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">We couldn't connect to our services. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Refresh
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {showSplash ? <SplashScreen /> : <AuthScreen />}
    </main>
  )
}
