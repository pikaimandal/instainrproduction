"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"

export default function KycInfoPage() {
  const router = useRouter()

  // In a real app, this would come from an API or state management
  const kycData = {
    status: "verified",
    aadhaar: "XXXX XXXX 1234",
    pan: "ABCDE1234F",
    verifiedOn: "10 Jan 2025",
  }

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
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                Verified
              </Badge>
            </div>

            <div className="rounded-lg bg-green-950/30 p-4 border border-green-900/50">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-green-300 font-medium">Your account is fully verified</p>
                  <p className="text-xs text-green-400/70 mt-1">Verified on {kycData.verifiedOn}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500">Aadhaar Number</span>
                <p className="text-lg font-medium">{kycData.aadhaar}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-500">PAN Number</span>
                <p className="text-lg font-medium">{kycData.pan}</p>
              </div>
            </div>

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
