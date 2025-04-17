"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SplashScreen from "@/components/splash-screen"
import AuthScreen from "@/components/auth-screen"
import { isSupabaseInitialized } from "@/lib/supabase"
import { checkRequiredConfig } from "@/lib/config"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check for missing required configuration
    const { valid, missing } = checkRequiredConfig();
    
    if (!valid) {
      console.error("Missing environment variables:", missing);
      setErrorDetails(missing);
      setHasError(true);
    } else if (!isSupabaseInitialized()) {
      console.error("Supabase is not initialized properly");
      setErrorDetails(["Supabase could not be initialized"]);
      setHasError(true);
    }

    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  // Function to force reload the page
  const handleRetry = () => {
    window.location.reload();
  }

  if (hasError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center w-full max-w-md">
          <div className="mb-8 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-600 text-white">
            <span className="text-2xl">!</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <p className="mb-6">We couldn't initialize the application properly. Please try again later.</p>
          
          {errorDetails.length > 0 && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left">
              <p className="font-semibold mb-2">Missing environment variables:</p>
              <ul className="list-disc list-inside">
                {errorDetails.map((detail, index) => (
                  <li key={index} className="text-sm text-red-600 dark:text-red-400">{detail}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm">Please check your server configuration.</p>
            </div>
          )}
          
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
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
