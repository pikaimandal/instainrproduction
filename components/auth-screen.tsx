"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, UserPlus, ExternalLink } from "lucide-react"
import OnboardingFlow from "@/components/onboarding-flow"
import Dialog from '@/components/dialog'
import { MiniKit, MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js"
import { toast } from "sonner"

import Image from 'next/image'
import Logo from '../public/instainr-logo.png'

export default function AuthScreen() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if running inside World App
    const checkIsWorldApp = async () => {
      const isInstalled = await MiniKit.isInstalled()
      setIsWorldApp(isInstalled)
    }
    
    checkIsWorldApp()
  }, [])

  const authenticateWithWallet = async (isNewAccount: boolean) => {
    if (!isWorldApp) {
      return
    }
    
    setLoading(true)
    
    try {
      // Get nonce from server
      const nonceResponse = await fetch('/api/nonce')
      if (!nonceResponse.ok) {
        throw new Error('Failed to get authentication nonce')
      }
      
      const nonceData = await nonceResponse.json()
      const nonce = nonceData.nonce
      
      // Request wallet authentication
      const authRequest = {
        statement: 'Sign in to InstaINR',
        nonce: nonce,
        requestId: isNewAccount ? 'new_account' : 'login',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
      }
      
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth(authRequest)
      
      if (finalPayload.status === 'error') {
        toast.error("Authentication failed. Please try again.")
        return
      }
      
      // Verify authentication on the server
      const verifyResponse = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce: nonce,
        }),
      })
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.message || 'Authentication verification failed')
      }
      
      const userData = await verifyResponse.json()
      
      // Handle successful authentication
      if (isNewAccount) {
        // For new accounts, show onboarding
        setShowOnboarding(true)
      } else {
        // For existing users, redirect to home
        router.push('/dashboard')
      }
      
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    authenticateWithWallet(false)
  }

  const handleCreateAccount = () => {
    authenticateWithWallet(true)
  }

  const openInWorldApp = () => {
    window.open("https://worldcoin.org/download", "_blank")
  }

  if (showOnboarding) {
    return <OnboardingFlow />
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <Image
        src={Logo}
        alt="InstaINR Logo"
        width={100}
        height={100}
        className="mb-8"
      />
      <h1 className="mb-2 text-3xl font-bold">Welcome</h1>
      <p className="mb-8 text-gray-600">Sign in or create a new account</p>
      
      {!isWorldApp && (
        <div className="mb-8 rounded-md bg-red-50 p-4 text-red-600">
          <p className="mb-2">InstaINR requires World App to function.</p>
          <p className="flex items-center justify-center">
            <span 
              className="flex cursor-pointer items-center text-blue-600 hover:underline"
              onClick={openInWorldApp}
            >
              Click here to open it in World App <ExternalLink className="ml-1 h-4 w-4" />
            </span>
          </p>
        </div>
      )}

      <div className="w-full max-w-md space-y-4">
        <button
          onClick={handleLogin}
          disabled={loading || !isWorldApp}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Login with World Wallet'}
        </button>
        <button
          onClick={handleCreateAccount}
          disabled={loading || !isWorldApp}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Create a New Account'}
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        By continuing, you agree to our{' '}
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => setShowTerms(true)}
        >
          Terms of Service
        </span>{' '}
        and{' '}
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => setShowPrivacy(true)}
        >
          Privacy Policy
        </span>
      </div>
      
      {/* Onboarding Dialog */}
      <Dialog
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        title="Complete Your Profile"
      >
        <div className="p-4">
          <p className="mb-4">
            Thank you for connecting your wallet! Please complete your profile
            to continue.
          </p>
          <OnboardingFlow />
        </div>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog
        open={showTerms}
        onClose={() => setShowTerms(false)}
        title="Terms of Service"
      >
        <div className="max-h-96 overflow-y-auto p-4">
          <h3 className="mb-2 text-lg font-semibold">1. Acceptance of Terms</h3>
          <p className="mb-4">
            By accessing or using InstaINR, you agree to be bound by these Terms
            of Service. If you do not agree to these terms, please do not use the
            service.
          </p>

          <h3 className="mb-2 text-lg font-semibold">2. Description of Service</h3>
          <p className="mb-4">
            InstaINR is a service that allows users to convert cryptocurrency to
            Indian Rupees (INR). The service integrates with the World Wallet to
            facilitate these transactions.
          </p>

          <h3 className="mb-2 text-lg font-semibold">3. User Responsibilities</h3>
          <p className="mb-4">
            Users are responsible for maintaining the confidentiality of their
            account information and for all activities that occur under their
            account. Users must provide accurate and complete information when
            using the service.
          </p>

          <h3 className="mb-2 text-lg font-semibold">4. Privacy Policy</h3>
          <p className="mb-4">
            Your use of InstaINR is subject to our Privacy Policy, which
            describes how we collect, use, and share your information.
          </p>

          <h3 className="mb-2 text-lg font-semibold">5. Limitations of Liability</h3>
          <p className="mb-4">
            InstaINR will not be liable for any direct, indirect, incidental,
            special, consequential, or exemplary damages resulting from your use
            of the service.
          </p>

          <h3 className="mb-2 text-lg font-semibold">6. Changes to Terms</h3>
          <p className="mb-4">
            InstaINR reserves the right to modify these terms at any time. Your
            continued use of the service after such changes constitutes your
            acceptance of the new terms.
          </p>
        </div>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Privacy Policy"
      >
        <div className="max-h-96 overflow-y-auto p-4">
          <h3 className="mb-2 text-lg font-semibold">1. Information We Collect</h3>
          <p className="mb-4">
            When you use InstaINR, we collect information that you provide
            directly to us, such as your name, email address, wallet address, and
            other personal information required to process transactions.
          </p>

          <h3 className="mb-2 text-lg font-semibold">2. How We Use Your Information</h3>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve
            our services, to process transactions, to communicate with you, and
            to comply with legal obligations.
          </p>

          <h3 className="mb-2 text-lg font-semibold">3. Information Sharing</h3>
          <p className="mb-4">
            We may share your information with third-party service providers who
            perform services on our behalf, such as payment processing and data
            analysis. We may also share information to comply with laws and
            regulations.
          </p>

          <h3 className="mb-2 text-lg font-semibold">4. Security</h3>
          <p className="mb-4">
            We take reasonable measures to help protect your personal information
            from loss, theft, misuse, and unauthorized access, disclosure,
            alteration, and destruction.
          </p>

          <h3 className="mb-2 text-lg font-semibold">5. Your Choices</h3>
          <p className="mb-4">
            You can access, update, or delete your account information at any
            time by logging into your account. You can also choose not to provide
            certain information, but this may limit your ability to use some
            features of our service.
          </p>

          <h3 className="mb-2 text-lg font-semibold">6. Changes to this Privacy Policy</h3>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new privacy policy on this page.
          </p>
        </div>
      </Dialog>
    </div>
  )
}
