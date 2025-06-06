"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, CreditCard, LogOut, Shield, User, Bell, Mail, Phone } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/lib/hooks/useUser"
import { Skeleton } from "@/components/ui/skeleton"

export default function Profile() {
  const { user, paymentMethods, isLoading, error } = useUser();
  const [notificationSettings, setNotificationSettings] = useState({
      transaction: true,
      email: true,
      whatsapp: false,
  });
  const router = useRouter();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('user_id');
    // Redirect to auth page
    router.push("/");
  }

  const handleNotificationToggle = (type: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [type]: !notificationSettings[type],
    });
  }

  const faqs = [
    {
      question: "How long does it take to convert crypto to INR?",
      answer:
        "Typically, conversions are processed within 60 minutes. However, during high network congestion, it may take longer.",
    },
    {
      question: "What are the fees for conversion?",
      answer: "InstaINR charges a flat 2% platform fee on all conversions. There are no hidden charges.",
    },
    {
      question: "How do I add a new payment method?",
      answer:
        "Go to the Payment Methods section in your profile and click on '+ Add Payment Method'. You can add bank accounts or UPI IDs.",
    },
    {
      question: "Is KYC mandatory?",
      answer: "Yes, as per Indian regulations, KYC verification is mandatory for all users to convert crypto to INR.",
    },
    {
      question: "What cryptocurrencies can I convert to INR?",
      answer:
        "Currently, InstaINR supports WLD (Worldcoin), ETH (Ethereum), and USDC (USD Coin). More cryptocurrencies will be added soon.",
    },
  ];

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
          <p>{error || "User data not found. Please try logging in again."}</p>
          <Button
            onClick={handleLogout}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // Format user data for display
  const formattedMobileNumber = user.mobile_number ? `+91 ${user.mobile_number}` : 'Not provided';
  const formattedAadhaar = user.aadhaar_number 
    ? `XXXX XXXX ${user.aadhaar_number.slice(-4)}` 
    : 'Not provided';
  const formattedPan = user.pan_number || 'Not provided';
  
  // Convert payment methods to display format
  const formattedPaymentMethods = [
    ...paymentMethods.bank.map(bank => ({
      type: "bank",
      name: bank.bank_name,
      details: `XXXX XXXX ${bank.account_number.slice(-4)}`,
      primary: bank.is_default,
      id: bank.id
    })),
    ...paymentMethods.upi.map(upi => ({
      type: "upi",
      name: "UPI ID",
      details: upi.upi_id,
      primary: upi.is_default,
      id: upi.id
    }))
  ];

  const isKycVerified = !!(user.aadhaar_number && user.pan_number);

  return (
    <main className="min-h-screen bg-black">
      <div className="container max-w-md mx-auto px-4 pb-20 pt-6">
        <div className="mb-6">
          <div className="flex items-center mb-6">
            <Avatar className="h-16 w-16 mr-4 border-2 border-blue-500">
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.full_name}</h1>
              <p className="text-zinc-400">{user.email || 'No email provided'}</p>
              <div className="flex items-center mt-1">
                {isKycVerified ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  KYC Verified
                </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    KYC Incomplete
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/profile/personal-info">
                  <ProfileItem
                    icon={<User className="h-5 w-5 text-blue-400" />}
                    title="Personal Information"
                    description={`${user.full_name} · ${formattedMobileNumber}`}
                  />
                </Link>
                <Link href="/profile/kyc-info">
                  <ProfileItem
                    icon={<Shield className="h-5 w-5 text-green-400" />}
                    title="KYC Information"
                    description={`${formattedAadhaar} · ${formattedPan}`}
                  />
                </Link>
                <Link href="/profile/payment-methods">
                  <ProfileItem
                    icon={<CreditCard className="h-5 w-5 text-purple-400" />}
                    title="Payment Methods"
                    description={`${formattedPaymentMethods.length} method${formattedPaymentMethods.length !== 1 ? 's' : ''}`}
                  />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <CardDescription>Manage your withdrawal methods</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid grid-cols-3 bg-zinc-800">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="bank">Bank</TabsTrigger>
                  <TabsTrigger value="upi">UPI</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="pt-4 space-y-3">
                  {formattedPaymentMethods.length > 0 ? (
                    formattedPaymentMethods.map((method, index) => (
                    <Link
                        href={`/profile/payment-methods/edit?id=${method.id}`}
                      key={index}
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              method.type === "bank" ? "bg-purple-500/20" : "bg-blue-500/20"
                            }`}
                          >
                            {method.type === "bank" ? (
                              <CreditCard className="h-5 w-5 text-purple-400" />
                            ) : (
                              <div className="text-blue-400 font-bold">UPI</div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{method.name}</p>
                              {method.primary && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                                >
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">{method.details}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-400" />
                      </div>
                    </Link>
                    ))
                  ) : (
                    <div className="text-center py-6 text-zinc-500">
                      <p>No payment methods added</p>
                    </div>
                  )}
                  <Link href="/profile/payment-methods/add">
                    <Button variant="outline" className="w-full border-dashed border-zinc-700 hover:bg-zinc-800">
                      + Add Payment Method
                    </Button>
                  </Link>
                </TabsContent>

                <TabsContent value="bank" className="pt-4 space-y-3">
                  {formattedPaymentMethods.filter(m => m.type === "bank").length > 0 ? (
                    formattedPaymentMethods
                    .filter((method) => method.type === "bank")
                    .map((method, index) => (
                        <Link href={`/profile/payment-methods/edit?id=${method.id}`} key={index}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                              <CreditCard className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{method.name}</p>
                                {method.primary && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  >
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500">{method.details}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-zinc-400" />
                        </div>
                      </Link>
                      ))
                  ) : (
                    <div className="text-center py-6 text-zinc-500">
                      <p>No bank accounts added</p>
                    </div>
                  )}
                  <Link href="/profile/payment-methods/add">
                    <Button variant="outline" className="w-full border-dashed border-zinc-700 hover:bg-zinc-800">
                      + Add Bank Account
                    </Button>
                  </Link>
                </TabsContent>

                <TabsContent value="upi" className="pt-4 space-y-3">
                  {formattedPaymentMethods.filter(m => m.type === "upi").length > 0 ? (
                    formattedPaymentMethods
                    .filter((method) => method.type === "upi")
                    .map((method, index) => (
                        <Link href={`/profile/payment-methods/edit?id=${method.id}`} key={index}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                              <div className="text-blue-400 font-bold">UPI</div>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{method.name}</p>
                                {method.primary && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  >
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500">{method.details}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-zinc-400" />
                        </div>
                      </Link>
                      ))
                  ) : (
                    <div className="text-center py-6 text-zinc-500">
                      <p>No UPI IDs added</p>
                    </div>
                  )}
                  <Link href="/profile/payment-methods/add">
                    <Button variant="outline" className="w-full border-dashed border-zinc-700 hover:bg-zinc-800">
                      + Add UPI ID
                    </Button>
                  </Link>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <Bell className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Transaction Notifications</p>
                      <p className="text-xs text-zinc-500">Get notified about your conversions</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.transaction}
                    onCheckedChange={() => handleNotificationToggle("transaction")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-400"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-xs text-zinc-500">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={() => handleNotificationToggle("email")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-400"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp Notifications</p>
                      <p className="text-xs text-zinc-500">Get updates via WhatsApp</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsapp}
                    onCheckedChange={() => handleNotificationToggle("whatsapp")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              <CardDescription>Get answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-400">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contact Us</CardTitle>
              <CardDescription>Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Email Support</p>
                    <a href="mailto:support@instainr.com" className="text-blue-400 text-sm">
                      support@instainr.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp Support</p>
                    <a
                      href="https://wa.me/916297737219"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 text-sm"
                    >
                      +91 6297737219
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <DashboardHeader />
    </main>
  );
}

function ProfileItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer">
      <div className="flex items-center">
        <div className="mr-3">{icon}</div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-zinc-400" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container max-w-md mx-auto px-4 pb-20 pt-6">
        <div className="mb-6">
          <div className="flex items-center mb-6">
            <Skeleton className="h-16 w-16 rounded-full mr-4" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <CardDescription>Manage your withdrawal methods</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid grid-cols-3 bg-zinc-800">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="bank">Bank</TabsTrigger>
                  <TabsTrigger value="upi">UPI</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="pt-4 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <DashboardHeader />
      </div>
    </main>
  );
}
