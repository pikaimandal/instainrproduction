"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SplashScreen from "@/components/splash-screen"
import AuthScreen from "@/components/auth-screen"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {showSplash ? <SplashScreen /> : <AuthScreen />}
    </main>
  )
}
