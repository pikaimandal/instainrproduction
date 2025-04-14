"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ConvertFormProps {
  walletData: {
    wld: { balance: number; value: number; rate: number }
    eth: { balance: number; value: number; rate: number }
    usdc: { balance: number; value: number; rate: number }
  }
}

export default function ConvertForm({ walletData }: ConvertFormProps) {
  const [fromCurrency, setFromCurrency] = useState("wld")
  const [toCurrency, setToCurrency] = useState("inr")
  const [amount, setAmount] = useState("")
  const [estimatedAmount, setEstimatedAmount] = useState("0")
  const [isConverting, setIsConverting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("primary")
  const router = useRouter()

  // Get conversion rates from wallet data
  const rates = {
    wld: walletData.wld.rate,
    eth: walletData.eth.rate,
    usdc: walletData.usdc.rate,
  }

  // Get available balances from wallet data
  const balances = {
    wld: walletData.wld.balance,
    eth: walletData.eth.balance,
    usdc: walletData.usdc.balance,
  }

  // Update estimated amount when amount or currency changes
  useEffect(() => {
    if (amount && !isNaN(Number.parseFloat(amount))) {
      const rate = rates[fromCurrency as keyof typeof rates]
      const estimated = (Number.parseFloat(amount) * rate).toFixed(2)
      setEstimatedAmount(estimated)
    }
  }, [amount, fromCurrency])

  // Payment methods
  const paymentMethods = [
    {
      id: "primary",
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
  ]

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)

    if (value && !isNaN(Number.parseFloat(value))) {
      const rate = rates[fromCurrency as keyof typeof rates]
      const estimated = (Number.parseFloat(value) * rate).toFixed(2)
      setEstimatedAmount(estimated)
    } else {
      setEstimatedAmount("0")
    }
  }

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value)
    if (amount && !isNaN(Number.parseFloat(amount))) {
      const rate = rates[value as keyof typeof rates]
      const estimated = (Number.parseFloat(amount) * rate).toFixed(2)
      setEstimatedAmount(estimated)
    }
  }

  const handleConvert = () => {
    // Validate amount
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      return
    }

    // Check if amount is less than or equal to available balance
    if (Number.parseFloat(amount) > balances[fromCurrency as keyof typeof balances]) {
      return
    }

    // Show confirmation dialog
    setShowConfirmation(true)
  }

  const handleConfirmConvert = () => {
    setShowConfirmation(false)
    setIsConverting(true)

    // Simulate conversion process and redirect to history page with processing status
    setTimeout(() => {
      router.push("/history?status=processing")
    }, 1500)
  }

  // Calculate platform fee (2%)
  const platformFee =
    amount && !isNaN(Number.parseFloat(amount)) ? (Number.parseFloat(estimatedAmount) * 0.02).toFixed(2) : "0.00"

  // Calculate final amount after fee
  const finalAmount =
    amount && !isNaN(Number.parseFloat(amount))
      ? (Number.parseFloat(estimatedAmount) - Number.parseFloat(platformFee)).toFixed(2)
      : "0.00"

  // Check if conversion is valid
  const isValidConversion =
    amount &&
    !isNaN(Number.parseFloat(amount)) &&
    Number.parseFloat(amount) > 0 &&
    Number.parseFloat(amount) <= balances[fromCurrency as keyof typeof balances]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-zinc-400">From</label>
          <span className="text-xs text-zinc-500">
            Available:
            {fromCurrency === "wld" && ` ${balances.wld} WLD`}
            {fromCurrency === "eth" && ` ${balances.eth} ETH`}
            {fromCurrency === "usdc" && ` ${balances.usdc} USDC`}
          </span>
        </div>
        <div className="flex space-x-2">
          <Select value={fromCurrency} onValueChange={handleFromCurrencyChange} disabled={isConverting}>
            <SelectTrigger className="w-1/3 bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="wld">WLD</SelectItem>
              <SelectItem value="eth">ETH</SelectItem>
              <SelectItem value="usdc">USDC</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            className="bg-zinc-800 border-zinc-700"
            disabled={isConverting}
          />
        </div>
        {amount && Number.parseFloat(amount) > balances[fromCurrency as keyof typeof balances] && (
          <p className="text-xs text-red-500">Insufficient balance</p>
        )}
      </div>

      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
          <ArrowDown className="h-4 w-4 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">To</label>
        <div className="flex space-x-2">
          <Select value={toCurrency} onValueChange={setToCurrency} disabled>
            <SelectTrigger className="w-1/3 bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inr">INR</SelectItem>
            </SelectContent>
          </Select>
          <Input readOnly value={`₹ ${estimatedAmount}`} className="bg-zinc-800 border-zinc-700" />
        </div>
      </div>

      <div className="pt-2">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleConvert}
          disabled={!isValidConversion || isConverting}
        >
          {isConverting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Convert Now"
          )}
        </Button>
        <div className="text-center text-xs text-zinc-500 mt-2">Estimated processing time: 60 minutes</div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Conversion</DialogTitle>
            <DialogDescription>Please review the details of your conversion</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Conversion Details</h3>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-zinc-400">From</span>
                <span className="text-sm">
                  {amount} {fromCurrency.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-zinc-400">To</span>
                <span className="text-sm">₹{estimatedAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-zinc-400">Conversion Rate</span>
                <span className="text-sm">₹{rates[fromCurrency as keyof typeof rates]}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-zinc-400">Platform Fee (2%)</span>
                <span className="text-sm">₹{platformFee}</span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span className="text-sm">You Receive</span>
                <span className="text-sm">₹{finalAmount}</span>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Payment Method</h3>
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2 mb-3 last:mb-0">
                    <RadioGroupItem value={method.id} id={method.id} className="text-blue-500" />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                              method.type === "bank" ? "bg-purple-500/20" : "bg-blue-500/20"
                            }`}
                          >
                            {method.type === "bank" ? (
                              <span className="text-purple-400 text-xs">BANK</span>
                            ) : (
                              <span className="text-blue-400 text-xs">UPI</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm">{method.name}</p>
                            <p className="text-xs text-zinc-500">{method.details}</p>
                          </div>
                        </div>
                        {method.primary && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="rounded-lg bg-blue-950/30 p-3 border border-blue-900/50">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-300">
                  By proceeding, you agree to sell your {fromCurrency.toUpperCase()} tokens at the current market rate.
                  The INR amount will be transferred to your selected payment method within 60 minutes.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-zinc-700"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" onClick={handleConfirmConvert}>
              Confirm Conversion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
