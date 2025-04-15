"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, UserPlus, ExternalLink } from "lucide-react"
import OnboardingFlow from "@/components/onboarding-flow"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MiniKit } from "@worldcoin/minikit-js"
import { toast } from "sonner"

export default function AuthScreen() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if running inside World App
    setIsWorldApp(MiniKit.isInstalled())
  }, [])

  const authenticateWithWallet = async (isNewAccount: boolean = false) => {
    if (!isWorldApp) {
      return
    }

    try {
      setIsAuthenticating(true)
      
      // Get a nonce from the server
      const res = await fetch(`/api/nonce`)
      const { nonce } = await res.json()

      // Request wallet authentication
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: isNewAccount ? 'new_account' : 'login',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
        statement: 'Sign in to InstaINR - Convert your crypto to INR instantly',
      })

      if (finalPayload.status === 'error') {
        toast.error("Authentication failed. Please try again.")
        return
      }

      // Verify the authentication on the server
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const result = await response.json()
      
      if (result.status === 'success' && result.isValid) {
        // Store the wallet address for future use
        const walletAddress = MiniKit.walletAddress
        
        if (isNewAccount) {
          // For new accounts, proceed to onboarding
          setShowOnboarding(true)
        } else {
          // For existing accounts, redirect to dashboard
          router.push("/dashboard")
        }
      } else {
        toast.error("Authentication verification failed. Please try again.")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      toast.error("An error occurred during authentication. Please try again.")
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogin = () => {
    authenticateWithWallet(false)
  }

  const handleCreateAccount = () => {
    authenticateWithWallet(true)
  }

  const openInWorldApp = () => {
    window.open("https://worldcoin.org/ecosystem/app_a694eef5223a11d38b4f737fad00e561", "_blank")
  }

  if (showOnboarding) {
    return <OnboardingFlow />
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-white">₹</span>
        </div>
        <h1 className="text-4xl font-bold mb-1">InstaINR</h1>
        <p className="text-gray-400 text-sm">Convert your crypto to INR instantly</p>
      </div>

      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>Sign in or create a new account</CardDescription>
          {!isWorldApp && (
            <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-400 text-sm">
              InstaINR requires World App to function.{" "}
              <button 
                onClick={openInWorldApp} 
                className="inline-flex items-center text-blue-400 hover:underline"
              >
                Click here <ExternalLink className="ml-1 h-3 w-3" />
              </button>{" "}
              to open it in World App.
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700" 
            onClick={handleLogin}
            disabled={!isWorldApp || isAuthenticating}
          >
            <Wallet className="mr-2 h-5 w-5" />
            {isAuthenticating ? "Connecting..." : "Login with World Wallet"}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-400">Or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full h-12 border-zinc-700 hover:bg-zinc-800"
            onClick={handleCreateAccount}
            disabled={!isWorldApp || isAuthenticating}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            {isAuthenticating ? "Connecting..." : "Create a New Account"}
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-center text-zinc-500">
          <p>
            By continuing, you agree to our{" "}
            <button onClick={() => setShowTerms(true)} className="text-blue-400 hover:underline">
              TOS
            </button>{" "}
            and{" "}
            <button onClick={() => setShowPrivacy(true)} className="text-blue-400 hover:underline">
              Privacy Policy
            </button>
          </p>
        </CardFooter>
      </Card>

      {/* Terms of Service Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Last updated: April 14, 2025</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              Welcome to InstaINR. By using our service, you agree to comply with and be bound by the following terms
              and conditions.
            </p>

            <h3 className="text-base font-medium">1. Acceptance of Terms</h3>
            <p>
              By accessing or using InstaINR, you agree to be bound by these Terms of Service and all applicable laws
              and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing
              this site.
            </p>

            <h3 className="text-base font-medium">2. Use of Service</h3>
            <p>
              InstaINR provides a platform for converting cryptocurrency to Indian Rupees (INR). You must be at least 18
              years old and complete our KYC verification process to use our services. You agree to provide accurate and
              complete information during registration and KYC verification.
            </p>

            <h3 className="text-base font-medium">3. Fees and Charges</h3>
            <p>
              InstaINR charges a 2% platform fee on all conversions. This fee is transparently displayed before you
              confirm any transaction. We reserve the right to change our fee structure with prior notice.
            </p>

            <h3 className="text-base font-medium">4. Compliance with Laws</h3>
            <p>
              You agree to comply with all applicable laws and regulations, including but not limited to anti-money
              laundering (AML) and know your customer (KYC) requirements. InstaINR operates in compliance with Indian
              regulations and may be required to report suspicious transactions to relevant authorities.
            </p>

            <h3 className="text-base font-medium">5. Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account information and for all activities
              that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="text-base font-medium">6. Limitation of Liability</h3>
            <p>
              InstaINR shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary
              damages resulting from your use or inability to use the service.
            </p>

            <h3 className="text-base font-medium">7. Modifications</h3>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of InstaINR after any such
              changes constitutes your acceptance of the new terms.
            </p>

            <h3 className="text-base font-medium">8. Governing Law</h3>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India, without regard to its
              conflict of law provisions.
            </p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4" onClick={() => setShowTerms(false)}>
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>Last updated: April 14, 2025</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              At InstaINR, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect
              your personal information.
            </p>

            <h3 className="text-base font-medium">1. Information We Collect</h3>
            <p>
              We collect personal information such as your name, email address, mobile number, Aadhaar number, PAN
              number, and banking details. We also collect transaction data and usage information when you use our
              service.
            </p>

            <h3 className="text-base font-medium">2. How We Use Your Information</h3>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and maintain our service</li>
              <li>Process your transactions</li>
              <li>Comply with legal requirements including KYC and AML regulations</li>
              <li>Communicate with you about your account and transactions</li>
              <li>Improve our services and develop new features</li>
            </ul>

            <h3 className="text-base font-medium">3. Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized
              access or disclosure. Your KYC information is encrypted and stored securely.
            </p>

            <h3 className="text-base font-medium">4. Data Sharing</h3>
            <p>
              We may share your information with third-party service providers who help us operate our service, such as
              payment processors and KYC verification services. We may also disclose your information if required by law
              or to protect our rights.
            </p>

            <h3 className="text-base font-medium">5. Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your personal information. You can manage your
              notification preferences in your account settings.
            </p>

            <h3 className="text-base font-medium">6. Cookies and Tracking</h3>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver
              personalized content.
            </p>

            <h3 className="text-base font-medium">7. Changes to This Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page.
            </p>

            <h3 className="text-base font-medium">8. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at support@instainr.com.</p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4" onClick={() => setShowPrivacy(false)}>
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
