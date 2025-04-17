"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { useUser } from "@/lib/hooks/useUser"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function KycInfoPage() {
  const router = useRouter()
  const { user, isLoading, error } = useUser()

  if (isLoading) {
    return <KycSkeleton />
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
          <p>{error || "User data not found. Please try logging in again."}</p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  // Format KYC data for display
  const isVerified = !!(user.aadhaar_number && user.pan_number)
  const formattedAadhaar = user.aadhaar_number 
    ? `XXXX XXXX ${user.aadhaar_number.slice(-4)}` 
    : 'Not provided'
  const formattedPan = user.pan_number || 'Not provided'
  const verifiedOn = isVerified 
    ? new Date(user.updated_at).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      }) 
    : 'N/A'

  return (
    <main className="min-h-screen bg-black pb-20">
      <div className="container max-w-md mx-auto px-4 pt-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>KYC Information</CardTitle>
            </div>
            <CardDescription>Your verification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">KYC Status</span>
              {isVerified ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  Incomplete
                </Badge>
              )}
            </div>

            {isVerified ? (
              <div className="rounded-lg bg-green-950/30 p-4 border border-green-900/50">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-300 font-medium">Your account is fully verified</p>
                    <p className="text-xs text-green-400/70 mt-1">Verified on {verifiedOn}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-950/30 p-4 border border-yellow-900/50">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-300 font-medium">Your KYC is incomplete</p>
                    <p className="text-xs text-yellow-400/70 mt-1">
                      Please complete your KYC to access all features
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500">Aadhaar Number</span>
                <p className="text-lg font-medium">{formattedAadhaar}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-500">PAN Number</span>
                <p className="text-lg font-medium">{formattedPan}</p>
              </div>
            </div>

            {!isVerified && (
              <Link href="/onboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Complete KYC
                </Button>
              </Link>
            )}

            <div className="pt-2 text-center text-xs text-zinc-500">
              For security reasons, your full KYC details are partially masked.
              <br />
              Contact support if you need to update your KYC information.
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardHeader />
    </main>
  )
}

function KycSkeleton() {
  return (
    <main className="min-h-screen bg-black pb-20">
      <div className="container max-w-md mx-auto px-4 pt-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Skeleton className="h-10 w-10 rounded-md mr-2" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <Skeleton className="h-20 w-full rounded-lg" />

            <div className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-40" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-40" />
              </div>
            </div>

            <Skeleton className="h-12 rounded-md w-full" />
            
            <div className="flex flex-col items-center space-y-1">
              <Skeleton className="h-3 w-60" />
              <Skeleton className="h-3 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardHeader />
    </main>
  )
}
