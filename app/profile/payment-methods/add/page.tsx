"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"

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

export default function AddPaymentMethodPage() {
  const router = useRouter()
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

  const handleSave = () => {
    if (!validateForm()) return

    setIsSaving(true)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      router.push("/profile/payment-methods")
    }, 1000)
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
              <CardTitle>Add Payment Method</CardTitle>
            </div>
            <CardDescription>Add a new payment method for withdrawals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Payment Method Type</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="grid grid-cols-3 gap-2">
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="app" id="app" className="text-blue-500" />
                  <Label htmlFor="app" className="cursor-pointer">
                    UPI App
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
                    placeholder="1234567890"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    name="ifsc"
                    placeholder="HDFC0001234"
                    value={formData.ifsc}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  {errors.ifsc && <p className="text-xs text-red-500">{errors.ifsc}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    name="accountHolder"
                    placeholder="JOHN DOE"
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
                    placeholder="name@upi"
                    value={formData.upiId}
                    onChange={handleChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  {errors.upiId && <p className="text-xs text-red-500">{errors.upiId}</p>}
                  <p className="text-xs text-zinc-500">Enter your UPI ID (e.g., name@okaxis)</p>
                </div>
              </div>
            )}

            {paymentType === "app" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="upiMobile">Mobile Number</Label>
                  <div className="flex">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-l-md px-3 flex items-center text-zinc-400">
                      +91
                    </div>
                    <Input
                      id="upiMobile"
                      name="upiMobile"
                      placeholder="9876543210"
                      value={formData.upiMobile}
                      onChange={handleChange}
                      className="bg-zinc-800 border-zinc-700 rounded-l-none"
                    />
                  </div>
                  {errors.upiMobile && <p className="text-xs text-red-500">{errors.upiMobile}</p>}
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
              </div>
            )}
          </CardContent>
          <CardFooter>
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
                  Save Payment Method
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <DashboardHeader />
    </main>
  )
}
