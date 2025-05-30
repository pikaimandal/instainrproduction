"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { useUser } from "@/lib/hooks/useUser"
import { updateUser } from "@/lib/services/userService"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function PersonalInfoPage() {
  const router = useRouter()
  const { user, isLoading, error, refreshUserData } = useUser()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        mobile: user.mobile_number || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "fullName") {
      // Auto-capitalize full name
      const capitalizedValue = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      setFormData({ ...formData, [name]: capitalizedValue })
    } else if (name === "email") {
      // Auto-capitalize email
      setFormData({ ...formData, [name]: value.toUpperCase() })
    } else if (name === "mobile") {
      // Only allow numbers and limit to 10 digits
      if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
        setFormData({ ...formData, [name]: value })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      
      // Update user in database
      const updated = await updateUser(user.id, {
        full_name: formData.fullName,
        email: formData.email,
        mobile_number: formData.mobile,
      })
      
      if (!updated) {
        throw new Error("Failed to update profile")
      }

      // Refresh user data to get the updated information
      await refreshUserData()
      toast.success("Profile information updated successfully")
      setIsEditing(false)
    } catch (err) {
      console.error("Error updating user:", err)
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <ProfileSkeleton />
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

  return (
    <main className="min-h-screen bg-black pb-20">
      <div className="container max-w-md mx-auto px-4 pt-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>View and edit your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700"
                readOnly={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700"
                readOnly={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Indian Mobile Number</Label>
              <div className="flex">
                <div className="bg-zinc-800 border border-zinc-700 rounded-l-md px-3 flex items-center text-zinc-400">
                  +91
                </div>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 rounded-l-none"
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isEditing ? (
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            ) : (
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsEditing(true)}>
                Edit Information
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <DashboardHeader />
    </main>
  )
}

function ProfileSkeleton() {
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>

      <DashboardHeader />
    </main>
  )
}
