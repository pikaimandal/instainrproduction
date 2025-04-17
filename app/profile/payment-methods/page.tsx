"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Pencil, Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import DashboardHeader from "@/components/dashboard-header"
import { useUser } from "@/lib/hooks/useUser"
import { Skeleton } from "@/components/ui/skeleton"
import { deletePaymentMethod, setDefaultPaymentMethod } from "@/lib/services/paymentMethodService"
import { toast } from "sonner"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { user, paymentMethods, isLoading, error, refreshUserData } = useUser()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<{id: string, type: string, name: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingPrimary, setIsSettingPrimary] = useState(false)

  // Format payment methods for display
  const formattedPaymentMethods = [
    ...paymentMethods.bank.map(bank => ({
      id: bank.id,
      type: "bank",
      name: bank.bank_name,
      details: `XXXX XXXX ${bank.account_number.slice(-4)}`,
      primary: bank.is_default
    })),
    ...paymentMethods.upi.map(upi => ({
      id: upi.id,
      type: "upi",
      name: "UPI ID",
      details: upi.upi_id,
      primary: upi.is_default
    }))
  ]

  const handleDelete = async () => {
    if (!selectedMethod) return
    
    try {
      setIsDeleting(true)
      
      const deleted = await deletePaymentMethod(selectedMethod.id)
      
      if (!deleted) {
        throw new Error("Failed to delete payment method")
      }
      
      await refreshUserData()
      toast.success("Payment method deleted successfully")
    } catch (err) {
      console.error("Error deleting payment method:", err)
      toast.error(err instanceof Error ? err.message : "Failed to delete payment method")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setSelectedMethod(null)
    }
  }

  const handleSetPrimary = async (id: string) => {
    if (!user) return
    
    try {
      setIsSettingPrimary(true)
      
      const updated = await setDefaultPaymentMethod(id, user.id)
      
      if (!updated) {
        throw new Error("Failed to set payment method as primary")
      }
      
      await refreshUserData()
      toast.success("Default payment method updated")
    } catch (err) {
      console.error("Error setting primary payment method:", err)
      toast.error(err instanceof Error ? err.message : "Failed to update primary method")
    } finally {
      setIsSettingPrimary(false)
    }
  }

  const confirmDelete = (method: {id: string, type: string, name: string}) => {
    setSelectedMethod(method)
    setShowDeleteDialog(true)
  }

  const handleAddPaymentMethod = () => {
    router.push("/profile/payment-methods/add")
  }

  const handleEditPaymentMethod = (id: string) => {
    router.push(`/profile/payment-methods/edit?id=${id}`)
  }

  if (isLoading) {
    return <PaymentMethodsSkeleton />
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Error Loading Payment Methods</h2>
          <p>{error || "User data not found. Please try logging in again."}</p>
          <Button
            onClick={() => {
              localStorage.removeItem('wallet_address');
              localStorage.removeItem('user_id');
              router.push("/");
            }}
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
              <CardTitle>Payment Methods</CardTitle>
            </div>
            <CardDescription>Manage your withdrawal methods</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-3 bg-zinc-800">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="bank">Bank</TabsTrigger>
                <TabsTrigger value="upi">UPI</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="pt-4 space-y-3">
                {formattedPaymentMethods.length > 0 ? (
                  formattedPaymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            method.type === "bank" ? "bg-purple-500/20" : "bg-blue-500/20"
                          }`}
                        >
                          {method.type === "bank" ? (
                            <CreditCard className="h-5 w-5 text-purple-400" />
                          ) : (
                            <div className="text-blue-400 font-bold">UPI</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{method.name}</p>
                            {method.primary && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                              >
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">{method.details}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {!method.primary && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400"
                            onClick={() => handleSetPrimary(method.id)}
                            disabled={isSettingPrimary}
                          >
                            <Badge className="h-2 w-2 bg-blue-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400"
                          onClick={() => handleEditPaymentMethod(method.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400"
                          onClick={() => confirmDelete(method)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500">
                    <p>No payment methods added yet</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-zinc-700 hover:bg-zinc-800"
                  onClick={handleAddPaymentMethod}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </TabsContent>

              <TabsContent value="bank" className="pt-4 space-y-3">
                {formattedPaymentMethods.filter(m => m.type === "bank").length > 0 ? (
                  formattedPaymentMethods
                    .filter((method) => method.type === "bank")
                    .map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                            <CreditCard className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{method.name}</p>
                              {method.primary && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                                >
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">{method.details}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {!method.primary && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400"
                              onClick={() => handleSetPrimary(method.id)}
                              disabled={isSettingPrimary}
                            >
                              <Badge className="h-2 w-2 bg-blue-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400"
                            onClick={() => handleEditPaymentMethod(method.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400"
                            onClick={() => confirmDelete(method)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-zinc-500">
                    <p>No bank accounts added yet</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-zinc-700 hover:bg-zinc-800"
                  onClick={handleAddPaymentMethod}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bank Account
                </Button>
              </TabsContent>

              <TabsContent value="upi" className="pt-4 space-y-3">
                {formattedPaymentMethods.filter(m => m.type === "upi").length > 0 ? (
                  formattedPaymentMethods
                    .filter((method) => method.type === "upi")
                    .map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                            <div className="text-blue-400 font-bold">UPI</div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{method.name}</p>
                              {method.primary && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                                >
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">{method.details}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {!method.primary && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400"
                              onClick={() => handleSetPrimary(method.id)}
                              disabled={isSettingPrimary}
                            >
                              <Badge className="h-2 w-2 bg-blue-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400"
                            onClick={() => handleEditPaymentMethod(method.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400"
                            onClick={() => confirmDelete(method)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-zinc-500">
                    <p>No UPI IDs added yet</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-zinc-700 hover:bg-zinc-800"
                  onClick={handleAddPaymentMethod}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add UPI ID
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMethod?.type === 'bank' ? 'bank account' : 'UPI ID'}{' '}
              {selectedMethod?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DashboardHeader />
    </main>
  )
}

function PaymentMethodsSkeleton() {
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
          <CardContent>
            <Skeleton className="h-10 w-full rounded-md" />
            
            <div className="space-y-3 pt-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardHeader />
    </main>
  )
}
