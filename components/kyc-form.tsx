"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"

interface KycData {
  aadhaar: string
  pan: string
}

interface KycFormProps {
  data: KycData
  updateData: (data: Partial<KycData>) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function KycForm({ data, updateData, ...props }: KycFormProps) {
  const [errors, setErrors] = useState({
    aadhaar: "",
    pan: "",
  })

  const formatAadhaar = (value: string) => {
    // Remove all spaces first
    const digitsOnly = value.replace(/\s/g, "")

    // Only allow numbers and limit to 12 digits
    if (!/^\d*$/.test(digitsOnly) || digitsOnly.length > 12) {
      return data.aadhaar
    }

    // Format with spaces after every 4 digits
    let formatted = ""
    for (let i = 0; i < digitsOnly.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " "
      }
      formatted += digitsOnly[i]
    }

    return formatted
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "aadhaar") {
      const formattedValue = formatAadhaar(value)
      updateData({ [name]: formattedValue })
    } else if (name === "pan") {
      // PAN format: ABCDE1234F (5 letters, 4 numbers, 1 letter)
      // Convert to uppercase and validate format
      const upperValue = value.toUpperCase()

      // Only allow if it matches the PAN pattern or is incomplete
      if (upperValue === "" || /^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(upperValue)) {
        updateData({ [name]: upperValue })
      }
    } else {
      updateData({ [name]: value })
    }
  }

  // Validate fields
  useEffect(() => {
    const newErrors = {
      aadhaar: data.aadhaar
        ? data.aadhaar.replace(/\s/g, "").length === 12
          ? ""
          : "Aadhaar must be 12 digits"
        : "Aadhaar number is required",
      pan: data.pan
        ? /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan)
          ? ""
          : "PAN must be in format ABCDE1234F"
        : "PAN number is required",
    }
    setErrors(newErrors)
  }, [data])

  // Check if all fields are valid
  const isValid = !errors.aadhaar && !errors.pan

  // Update parent component about validation status
  useEffect(() => {
    // Pass validation status to parent component if a callback is provided
    if (typeof window !== "undefined" && props.onValidationChange) {
      props.onValidationChange(!errors.aadhaar && !errors.pan)
    }
  }, [errors])

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-950/30 p-3 border border-blue-900/50 mb-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <p className="text-sm text-blue-300">
            Your KYC information is securely stored and encrypted. We comply with all Indian regulations.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aadhaar">Aadhaar Number</Label>
        <Input
          id="aadhaar"
          name="aadhaar"
          placeholder="1234 5678 9012"
          value={data.aadhaar}
          onChange={handleChange}
          className="bg-zinc-800 border-zinc-700"
        />
        {errors.aadhaar && <p className="text-xs text-red-500">{errors.aadhaar}</p>}
        <p className="text-xs text-zinc-500">Enter 12-digit Aadhaar number with space after every 4 digits</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pan">PAN Number</Label>
        <Input
          id="pan"
          name="pan"
          placeholder="ABCDE1234F"
          value={data.pan}
          onChange={handleChange}
          className="bg-zinc-800 border-zinc-700"
        />
        {errors.pan && <p className="text-xs text-red-500">{errors.pan}</p>}
        <p className="text-xs text-zinc-500">Format: 5 capital letters + 4 digits + 1 capital letter</p>
      </div>
    </div>
  )
}
