"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PersonalInfoData {
  fullName: string
  email: string
  mobile: string
}

interface PersonalInfoFormProps {
  data: PersonalInfoData
  updateData: (data: Partial<PersonalInfoData>) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function PersonalInfoForm(props: PersonalInfoFormProps) {
  const { data, updateData } = props
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    mobile: "",
  })
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [emailPrefix, setEmailPrefix] = useState("")
  const emailSuggestions = ["gmail.com", "outlook.com", "outlook.in", "protonmail.com", "yahoo.com", "hotmail.com"]
  const emailInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "fullName") {
      // Auto-capitalize full name - all letters
      const capitalizedValue = value
        .split(" ")
        .map((word) => word.toUpperCase())
        .join(" ")
      updateData({ [name]: capitalizedValue })
    } else if (name === "email") {
      // Auto-capitalize email
      const upperValue = value.toUpperCase()
      updateData({ [name]: upperValue })

      // Check if email contains @ and show suggestions
      if (value.includes("@") && !value.split("@")[1]) {
        setEmailPrefix(value.split("@")[0])
        setShowEmailSuggestions(true)
      } else {
        setShowEmailSuggestions(false)
      }
    } else if (name === "mobile") {
      // Only allow numbers and limit to 10 digits
      if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
        updateData({ [name]: value })
      }
    } else {
      updateData({ [name]: value })
    }
  }

  const selectEmailSuggestion = (domain: string) => {
    const newEmail = `${emailPrefix}@${domain}`.toUpperCase()
    updateData({ email: newEmail })
    setShowEmailSuggestions(false)

    // Focus the input after selection
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }

  // Validate all fields
  useEffect(() => {
    const newErrors = {
      fullName: data.fullName ? "" : "Full name is required",
      email: data.email ? (/^\S+@\S+\.\S+$/.test(data.email) ? "" : "Invalid email format") : "Email is required",
      mobile: data.mobile
        ? data.mobile.length === 10
          ? ""
          : "Mobile number must be 10 digits"
        : "Mobile number is required",
    }
    setErrors(newErrors)
  }, [data])

  // Check if all fields are valid
  const isValid = !errors.fullName && !errors.email && !errors.mobile

  // Update parent component about validation status
  useEffect(() => {
    // Pass validation status to parent component if a callback is provided
    if (typeof window !== "undefined" && props.onValidationChange) {
      props.onValidationChange(!errors.fullName && !errors.email && !errors.mobile)
    }
  }, [errors])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="JOHN DOE"
          value={data.fullName}
          onChange={handleChange}
          className="bg-zinc-800 border-zinc-700"
        />
        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="JOHN@EXAMPLE.COM"
            value={data.email}
            onChange={handleChange}
            className="bg-zinc-800 border-zinc-700"
            ref={emailInputRef}
          />
          {showEmailSuggestions && (
            <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {emailSuggestions.map((domain) => (
                <div
                  key={domain}
                  className="px-4 py-2 hover:bg-zinc-700 cursor-pointer text-sm"
                  onClick={() => selectEmailSuggestion(domain)}
                >
                  {`${emailPrefix}@${domain}`.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
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
            placeholder="9876543210"
            value={data.mobile}
            onChange={handleChange}
            className="bg-zinc-800 border-zinc-700 rounded-l-none"
          />
        </div>
        {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
        <p className="text-xs text-zinc-500">Enter 10-digit mobile number without country code</p>
      </div>
    </div>
  )
}
