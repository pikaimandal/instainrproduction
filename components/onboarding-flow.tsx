"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import PersonalInfoForm from "@/components/personal-info-form"
import KycForm from "@/components/kyc-form"
import PaymentMethodForm from "@/components/payment-method-form"

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
      upiApp: "gpay",
    },
  })
  const [isPersonalValid, setIsPersonalValid] = useState(false)
  const [isKycValid, setIsKycValid] = useState(false)
  const [isPaymentValid, setIsPaymentValid] = useState(false)
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
      // Submit the form and redirect to dashboard
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (currentStep === "kyc") {
      setCurrentStep("personal")
    } else if (currentStep === "payment") {
      setCurrentStep("kyc")
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
            (currentStep === "personal" && !isPersonalValid) ||
            (currentStep === "kyc" && !isKycValid) ||
            (currentStep === "payment" && !isPaymentValid)
          }
        >
          {currentStep === "payment" ? "Complete" : "Continue"}
          {currentStep !== "payment" && <ArrowRight className="ml-2 h-4 w-4" />}
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
