"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaymentData {
  method: string
  bankName: string
  accountNumber: string
  ifsc: string
  accountHolder: string
  upiId: string
  upiMobile: string
  upiApp: string
}

interface PaymentMethodFormProps {
  data: PaymentData
  updateData: (data: Partial<PaymentData>) => void
  onValidationChange?: (isValid: boolean) => void
}

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
]

export default function PaymentMethodForm(props: PaymentMethodFormProps) {
  const { data, updateData } = props
  const [errors, setErrors] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountHolder: "",
    upiId: "",
    upiMobile: "",
    upiApp: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "accountHolder") {
      // Auto-capitalize account holder name
      updateData({ [name]: value.toUpperCase() })
    } else if (name === "accountNumber") {
      // Only allow numbers for account number
      if (value === "" || /^\d+$/.test(value)) {
        updateData({ [name]: value })
      }
    } else if (name === "ifsc") {
      // Auto-capitalize IFSC code
      updateData({ [name]: value.toUpperCase() })
    } else if (name === "upiMobile") {
      // Only allow numbers and limit to 10 digits
      if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
        updateData({ [name]: value })
      }
    } else {
      updateData({ [name]: value })
    }
  }

  const handleMethodChange = (value: string) => {
    updateData({ method: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value })
  }

  // Validate fields based on selected method
  useEffect(() => {
    const newErrors: any = {}

    if (data.method === "bank") {
      newErrors.bankName = data.bankName ? "" : "Bank name is required"
      newErrors.accountNumber = data.accountNumber
        ? /^\d{9,18}$/.test(data.accountNumber)
          ? ""
          : "Account number should be 9-18 digits"
        : "Account number is required"
      newErrors.ifsc = data.ifsc
        ? /^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc)
          ? ""
          : "IFSC should be in format ABCD0123456"
        : "IFSC code is required"
      newErrors.accountHolder = data.accountHolder ? "" : "Account holder name is required"
    } else if (data.method === "upi") {
      newErrors.upiId = data.upiId
        ? /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(data.upiId)
          ? ""
          : "Invalid UPI ID format"
        : "UPI ID is required"
    } else if (data.method === "app") {
      newErrors.upiMobile = data.upiMobile
        ? data.upiMobile.length === 10
          ? ""
          : "Mobile number must be 10 digits"
        : "Mobile number is required"
      newErrors.upiApp = data.upiApp ? "" : "UPI app selection is required"
    }

    setErrors(newErrors)
  }, [data])

  // Check if all required fields are valid based on selected method
  const isValid = () => {
    if (data.method === "bank") {
      return !errors.bankName && !errors.accountNumber && !errors.ifsc && !errors.accountHolder
    } else if (data.method === "upi") {
      return !errors.upiId
    } else if (data.method === "app") {
      return !errors.upiMobile && !errors.upiApp
    }
    return false
  }

  // Update parent component about validation status
  useEffect(() => {
    // Pass validation status to parent component if a callback is provided
    if (typeof window !== "undefined" && props.onValidationChange) {
      props.onValidationChange(isValid())
    }
  }, [errors, data.method])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Payment Method</Label>
        <RadioGroup value={data.method} onValueChange={handleMethodChange} className="grid grid-cols-3 gap-2">
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

      {data.method === "bank" && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select value={data.bankName} onValueChange={(value) => handleSelectChange("bankName", value)}>
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
              value={data.accountNumber}
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
              value={data.ifsc}
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
              value={data.accountHolder}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700"
            />
            {errors.accountHolder && <p className="text-xs text-red-500">{errors.accountHolder}</p>}
          </div>
        </div>
      )}

      {data.method === "upi" && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              name="upiId"
              placeholder="name@upi"
              value={data.upiId}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700"
            />
            {errors.upiId && <p className="text-xs text-red-500">{errors.upiId}</p>}
            <p className="text-xs text-zinc-500">Enter your UPI ID (e.g., name@okaxis)</p>
          </div>
        </div>
      )}

      {data.method === "app" && (
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
                value={data.upiMobile}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 rounded-l-none"
              />
            </div>
            {errors.upiMobile && <p className="text-xs text-red-500">{errors.upiMobile}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiApp">UPI App</Label>
            <Select value={data.upiApp} onValueChange={(value) => handleSelectChange("upiApp", value)}>
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
    </div>
  )
}
