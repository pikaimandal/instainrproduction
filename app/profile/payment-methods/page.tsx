"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Pencil, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DashboardHeader from "@/components/dashboard-header"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<any>(null)

  // In a real app, this would come from an API or state management
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "bank1",
      type: "bank",
      name: "HDFC Bank",
      details: "XXXX XXXX 5678",
      primary: true,
    },
    {
      id: "upi1",
      type: "upi",
      name: "UPI ID",
      details: "rahul@okaxis",
      primary: false,
    },
  ])

  const handleDelete = () => {
    if (selectedMethod) {
      setPaymentMethods(paymentMethods.filter((method) => method.id !== selectedMethod.id))
      setShowDeleteDialog(false)
      setSelectedMethod(null)
    }
  }

  const handleSetPrimary = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        primary: method.id === id,
      })),
    )
  }

  const confirmDelete = (method: any) => {
    setSelectedMethod(method)
    setShowDeleteDialog(true)
  }

  const handleAddPaymentMethod = () => {
    // In a real app, this would navigate to an add payment method form
    router.push("/profile/payment-methods/add")
  }

  const handleEditPaymentMethod = (id: string) => {
    // In a real app, this would navigate to an edit payment method form
    router.push(`/profile/payment-methods/edit?id=${id}`)
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
                {paymentMethods.map((method) => (
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
                ))}
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
                {paymentMethods
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
                  ))}
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
                {paymentMethods
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
                  ))}
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

      <DashboardHeader />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-zinc-700"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
