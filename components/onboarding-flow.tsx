"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import PersonalInfoForm from "@/components/personal-info-form"
import KycForm from "@/components/kyc-form"
import PaymentMethodForm from "@/components/payment-method-form"
import { toast } from "sonner"
import { updateUser } from "@/lib/services/userService"
import { addBankPaymentMethod, addUpiPaymentMethod } from "@/lib/services/paymentMethodService"
import { UpiApp } from "@/types/database"

type Step = "personal" | "kyc" | "payment"

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("personal")
  const [formData, setFormData] = useState({
    personal: {
      fullName: "",
      email: "",
      mobile: "",
    },
    kyc: {
      aadhaar: "",
      pan: "",
    },
    payment: {
      method: "bank",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      accountHolder: "",
      upiId: "",
      upiMobile: "",
      upiApp: "gpay" as UpiApp,
    },
  })
  const [isPersonalValid, setIsPersonalValid] = useState(false)
  const [isKycValid, setIsKycValid] = useState(false)
  const [isPaymentValid, setIsPaymentValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const updateFormData = (step: Step, data: any) => {
    setFormData({
      ...formData,
      [step]: {
        ...formData[step],
        ...data,
      },
    })
  }

  const handleNext = () => {
    if (currentStep === "personal") {
      setCurrentStep("kyc")
    } else if (currentStep === "kyc") {
      setCurrentStep("payment")
    } else if (currentStep === "payment" && isPaymentValid) {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep === "kyc") {
      setCurrentStep("personal")
    } else if (currentStep === "payment") {
      setCurrentStep("kyc")
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Get user ID from localStorage (set during authentication)
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        throw new Error('User ID not found. Please log in again.')
      }
      
      // Update user profile data in Supabase
      const userUpdated = await updateUser(userId, {
        full_name: formData.personal.fullName,
        email: formData.personal.email,
        mobile_number: formData.personal.mobile,
        aadhaar_number: formData.kyc.aadhaar.replace(/\s/g, ''), // Remove spaces
        pan_number: formData.kyc.pan,
      })
      
      if (!userUpdated) {
        throw new Error('Failed to update user profile')
      }
      
      // Add payment method based on selected type
      if (formData.payment.method === 'bank') {
        const bankAdded = await addBankPaymentMethod(
          userId,
          {
            bank_name: formData.payment.bankName,
            account_number: formData.payment.accountNumber,
            ifsc_code: formData.payment.ifsc,
            account_holder_name: formData.payment.accountHolder,
          },
          true // set as default
        )
        
        if (!bankAdded) {
          throw new Error('Failed to add bank payment method')
        }
      } else {
        // Add UPI payment method
        const upiAdded = await addUpiPaymentMethod(
          userId,
          {
            upi_id: formData.payment.upiId,
            upi_app: formData.payment.upiApp,
            upi_mobile_number: formData.payment.upiMobile,
          },
          true // set as default
        )
        
        if (!upiAdded) {
          throw new Error('Failed to add UPI payment method')
        }
      }
      
      toast.success('Profile created successfully!')
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Create Account</CardTitle>
          <div className="flex items-center space-x-1">
            <StepIndicator active={currentStep === "personal"} completed={currentStep !== "personal"} />
            <StepIndicator active={currentStep === "kyc"} completed={currentStep === "payment"} />
            <StepIndicator active={currentStep === "payment"} completed={false} />
          </div>
        </div>
        <CardDescription>
          {currentStep === "personal" && "Enter your personal information"}
          {currentStep === "kyc" && "Complete your KYC verification"}
          {currentStep === "payment" && "Set up your payment methods"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === "personal" && (
          <PersonalInfoForm
            data={formData.personal}
            updateData={(data) => updateFormData("personal", data)}
            onValidationChange={setIsPersonalValid}
          />
        )}
        {currentStep === "kyc" && (
          <KycForm
            data={formData.kyc}
            updateData={(data) => updateFormData("kyc", data)}
            onValidationChange={setIsKycValid}
          />
        )}
        {currentStep === "payment" && (
          <PaymentMethodForm
            data={formData.payment}
            updateData={(data) => updateFormData("payment", data)}
            onValidationChange={setIsPaymentValid}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep !== "personal" ? (
          <Button variant="outline" onClick={handleBack} className="border-zinc-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div></div>
        )}
        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={
            isSubmitting ||
            (currentStep === "personal" && !isPersonalValid) ||
            (currentStep === "kyc" && !isKycValid) ||
            (currentStep === "payment" && !isPaymentValid)
          }
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              {currentStep === "payment" ? "Complete" : "Continue"}
              {currentStep !== "payment" && <ArrowRight className="ml-2 h-4 w-4" />}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function StepIndicator({ active, completed }: { active: boolean; completed: boolean }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        active ? "bg-blue-600" : completed ? "bg-green-600" : "bg-zinc-800"
      }`}
    >
      {completed ? (
        <Check className="h-4 w-4 text-white" />
      ) : (
        <div className={`w-2 h-2 rounded-full ${active ? "bg-white" : "bg-zinc-600"}`} />
      )}
    </div>
  )
}
