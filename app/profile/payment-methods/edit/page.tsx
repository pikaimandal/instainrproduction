"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { useUser } from "@/lib/hooks/useUser"
import { Skeleton } from "@/components/ui/skeleton"
import { deletePaymentMethod, updatePaymentMethod, setDefaultPaymentMethod } from "@/lib/services/paymentMethodService"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

// List of major Indian banks
const INDIAN_BANKS = [
  "Axis Bank",
  "Bank of Baroda",
  "Bank of India",
  "Bank of Maharashtra",
  "Canara Bank",
  "Central Bank of India",
  "Federal Bank",
  "HDFC Bank",
  "ICICI Bank",
  "IDBI Bank",
  "IDFC First Bank",
  "Indian Bank",
  "Indian Overseas Bank",
  "IndusInd Bank",
  "Kotak Mahindra Bank",
  "Punjab & Sind Bank",
  "Punjab National Bank",
  "RBL Bank",
  "South Indian Bank",
  "State Bank of India",
  "UCO Bank",
  "Union Bank of India",
  "Yes Bank",
].sort()

export default function EditPaymentMethodPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("id")
  const { user, paymentMethods, isLoading, error, refreshUserData } = useUser()

  const [paymentType, setPaymentType] = useState("bank")
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountHolder: "",
    upiId: "",
    upiMobile: "",
    upiApp: "gpay",
  })
  const [errors, setErrors] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountHolder: "",
    upiId: "",
    upiMobile: "",
    upiApp: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPrimary, setIsPrimary] = useState(false)

  // Find the payment method
  const foundPaymentMethod = paymentId 
    ? [...paymentMethods.bank, ...paymentMethods.upi].find(method => method.id === paymentId)
    : null;

  // Load payment method data
  useEffect(() => {
    if (foundPaymentMethod) {
      setPaymentType(foundPaymentMethod.method_type)
      setIsPrimary(foundPaymentMethod.is_default)

      if (foundPaymentMethod.method_type === "bank") {
        const bankMethod = foundPaymentMethod as typeof foundPaymentMethod & {
          bank_name: string;
          account_number: string;
          ifsc_code: string;
          account_holder_name: string;
        };
        
        setFormData({
          ...formData,
          bankName: bankMethod.bank_name,
          accountNumber: bankMethod.account_number,
          ifsc: bankMethod.ifsc_code,
          accountHolder: bankMethod.account_holder_name,
        })
      } else if (foundPaymentMethod.method_type === "upi") {
        const upiMethod = foundPaymentMethod as typeof foundPaymentMethod & {
          upi_id: string;
          upi_mobile_number: string;
          upi_app: string;
        };
        
        setFormData({
          ...formData,
          upiId: upiMethod.upi_id,
          upiMobile: upiMethod.upi_mobile_number || "",
          upiApp: upiMethod.upi_app,
        })
      }
    }
  }, [foundPaymentMethod])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "accountHolder") {
      // Auto-capitalize account holder name
      setFormData({ ...formData, [name]: value.toUpperCase() })
    } else if (name === "accountNumber") {
      // Only allow numbers for account number
      if (value === "" || /^\d+$/.test(value)) {
        setFormData({ ...formData, [name]: value })
      }
    } else if (name === "ifsc") {
      // Auto-capitalize IFSC code
      setFormData({ ...formData, [name]: value.toUpperCase() })
    } else if (name === "upiMobile") {
      // Only allow numbers and limit to 10 digits
      if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
        setFormData({ ...formData, [name]: value })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (paymentType === "bank") {
      newErrors.bankName = formData.bankName ? "" : "Bank name is required"
      newErrors.accountNumber = formData.accountNumber
        ? /^\d{9,18}$/.test(formData.accountNumber)
          ? ""
          : "Account number should be 9-18 digits"
        : "Account number is required"
      newErrors.ifsc = formData.ifsc
        ? /^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)
          ? ""
          : "IFSC should be in format ABCD0123456"
        : "IFSC code is required"
      newErrors.accountHolder = formData.accountHolder ? "" : "Account holder name is required"
    } else if (paymentType === "upi") {
      newErrors.upiId = formData.upiId
        ? /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(formData.upiId)
          ? ""
          : "Invalid UPI ID format"
        : "UPI ID is required"
    } else if (paymentType === "app") {
      newErrors.upiMobile = formData.upiMobile
        ? formData.upiMobile.length === 10
          ? ""
          : "Mobile number must be 10 digits"
        : "Mobile number is required"
      newErrors.upiApp = formData.upiApp ? "" : "UPI app selection is required"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSave = async () => {
    if (!validateForm() || !paymentId || !user) return

    try {
      setIsSaving(true)
      
      // Prepare updates based on payment type
      let updates: any = {}
      
      if (paymentType === "bank") {
        updates = {
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          ifsc_code: formData.ifsc,
          account_holder_name: formData.accountHolder,
        }
      } else if (paymentType === "upi") {
        updates = {
          upi_id: formData.upiId,
          upi_app: formData.upiApp,
          upi_mobile_number: formData.upiMobile,
        }
      }
      
      // Update the payment method
      const updated = await updatePaymentMethod(paymentId, updates)
      
      if (!updated) {
        throw new Error("Failed to update payment method")
      }
      
      // Handle primary status if changed
      if (isPrimary !== foundPaymentMethod?.is_default) {
        if (isPrimary) {
          await setDefaultPaymentMethod(paymentId, user.id)
        }
      }
      
      await refreshUserData()
      toast.success("Payment method updated successfully")
      router.push("/profile/payment-methods")
    } catch (err) {
      console.error("Error updating payment method:", err)
      toast.error(err instanceof Error ? err.message : "Failed to update payment method")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!paymentId) return
    
    try {
      setIsDeleting(true)
      
      const deleted = await deletePaymentMethod(paymentId)
      
      if (!deleted) {
        throw new Error("Failed to delete payment method")
      }
      
      await refreshUserData()
      toast.success("Payment method deleted successfully")
      router.push("/profile/payment-methods")
    } catch (err) {
      console.error("Error deleting payment method:", err)
      toast.error(err instanceof Error ? err.message : "Failed to delete payment method")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return <PaymentMethodSkeleton />
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Error Loading Payment Method</h2>
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

  if (!foundPaymentMethod) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Payment Method Not Found</h2>
          <p>The payment method you're trying to edit doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.push("/profile/payment-methods")}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Payment Methods
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
              <CardTitle>Edit Payment Method</CardTitle>
            </div>
            <CardDescription>Update your payment method details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method Type</Label>
              <RadioGroup
                value={paymentType}
                onValueChange={setPaymentType}
                className="grid grid-cols-2 gap-2"
                disabled
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="bank" className="text-blue-500" />
                  <Label htmlFor="bank" className="cursor-pointer">
                    Bank Account
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" className="text-blue-500" />
                  <Label htmlFor="upi" className="cursor-pointer">
                    UPI ID
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentType === "bank" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select value={formData.bankName} onValueChange={(value) => handleSelectChange("bankName", value)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Select Bank" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {INDIAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankName && <p className="text-xs text-red-500">{errors.bankName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700"
                    maxLength={18}
                  />
                  {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700"
                    maxLength={11}
                  />
                  {errors.ifsc && <p className="text-xs text-red-500">{errors.ifsc}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  {errors.accountHolder && <p className="text-xs text-red-500">{errors.accountHolder}</p>}
                </div>
              </div>
            )}

            {paymentType === "upi" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="yourname@bankname"
                  />
                  {errors.upiId && <p className="text-xs text-red-500">{errors.upiId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upiApp">UPI App</Label>
                  <Select value={formData.upiApp} onValueChange={(value) => handleSelectChange("upiApp", value)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Select UPI App" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpay">Google Pay</SelectItem>
                      <SelectItem value="phonepe">PhonePe</SelectItem>
                      <SelectItem value="paytm">Paytm</SelectItem>
                      <SelectItem value="bhim">BHIM</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.upiApp && <p className="text-xs text-red-500">{errors.upiApp}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upiMobile">Mobile Number (Optional)</Label>
                  <div className="flex">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-l-md px-3 flex items-center text-zinc-400">
                      +91
                    </div>
                    <Input
                      id="upiMobile"
                      name="upiMobile"
                      value={formData.upiMobile}
                      onChange={handleChange}
                      className="bg-zinc-800 border-zinc-700 rounded-l-none"
                      placeholder="10-digit number"
                      maxLength={10}
                    />
                  </div>
                  {errors.upiMobile && <p className="text-xs text-red-500">{errors.upiMobile}</p>}
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <Label htmlFor="primary" className="font-medium">
                Set as Primary Method
              </Label>
              <Switch
                id="primary"
                checked={isPrimary}
                onCheckedChange={setIsPrimary}
                disabled={foundPaymentMethod.is_default}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={isSaving}
            >
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

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Payment Method
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
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

function PaymentMethodSkeleton() {
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
            <Skeleton className="h-10 w-full" />
            
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            
            <Skeleton className="h-8 w-full mt-4" />
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>

      <DashboardHeader />
    </main>
  )
}
