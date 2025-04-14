"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, Clock, Search, ExternalLink, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import DashboardHeader from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function History() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const searchParams = useSearchParams()

  // Check if we're coming from a conversion
  useEffect(() => {
    const status = searchParams.get("status")
    if (status === "processing") {
      setActiveTab("processing")
    }
  }, [searchParams])

  // Mock transaction data
  const transactions = [
    {
      id: "tx1",
      type: "conversion",
      status: "processing",
      fromCurrency: "WLD",
      toCurrency: "INR",
      fromAmount: "5",
      toAmount: "250",
      date: "Just now",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      paymentMethod: "HDFC Bank",
      paymentDetails: "XXXX XXXX 5678",
      platformFee: "5.00",
      conversionRate: "50.00",
      txHash: "0x1a2b3c4d5e6f...",
      estimatedTime: "60 minutes",
      completedTime: "In progress",
      estimatedCompletion: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      id: "tx2",
      type: "conversion",
      status: "completed",
      fromCurrency: "ETH",
      toCurrency: "INR",
      fromAmount: "0.05",
      toAmount: "9,000",
      date: "Apr 6, 2025",
      time: "10:15",
      paymentMethod: "UPI ID",
      paymentDetails: "rahul@okaxis",
      platformFee: "180.00",
      conversionRate: "180,000.00",
      txHash: "0x7a8b9c0d1e2f...",
      estimatedTime: "60 minutes",
      completedTime: "45 minutes",
    },
    {
      id: "tx3",
      type: "conversion",
      status: "completed",
      fromCurrency: "USDC",
      toCurrency: "INR",
      fromAmount: "50",
      toAmount: "4,150",
      date: "Apr 4, 2025",
      time: "09:45",
      paymentMethod: "HDFC Bank",
      paymentDetails: "XXXX XXXX 5678",
      platformFee: "83.00",
      conversionRate: "83.00",
      txHash: "0x3a4b5c6d7e8f...",
      estimatedTime: "60 minutes",
      completedTime: "62 minutes",
    },
  ]

  const filteredTransactions = transactions.filter(
    (tx) =>
      (tx.fromCurrency?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.toCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activeTab === "all" || tx.status === activeTab),
  )

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction)
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container max-w-md mx-auto px-4 pb-20 pt-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-sm font-bold text-white">₹</span>
              </div>
              <h1 className="text-2xl font-bold">Transaction History</h1>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <Input
              placeholder="Search transactions"
              className="pl-9 bg-zinc-800 border-zinc-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 bg-zinc-800">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="processing">Processing</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="pt-4">
                  {filteredTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                          onClick={() => handleTransactionClick(tx)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                                {tx.status === "processing" ? (
                                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                                ) : (
                                  <ArrowDown className="h-4 w-4 text-blue-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {tx.fromCurrency} to {tx.toCurrency}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {tx.date} • {tx.time}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{tx.toAmount}</p>
                              <p className="text-xs text-zinc-500">
                                {tx.fromAmount} {tx.fromCurrency}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                tx.status === "completed"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {tx.status === "completed" ? "Completed" : "Processing"}
                            </span>
                            <div className="flex items-center">
                              <span className="text-xs text-zinc-500 mr-1">{tx.paymentMethod}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-center text-zinc-500">
                      <div>
                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No transactions found</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="processing" className="pt-4">
                  {filteredTransactions.filter((tx) => tx.status === "processing").length > 0 ? (
                    <div className="space-y-4">
                      {filteredTransactions
                        .filter((tx) => tx.status === "processing")
                        .map((tx) => (
                          <div
                            key={tx.id}
                            className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                            onClick={() => handleTransactionClick(tx)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {tx.fromCurrency} to {tx.toCurrency}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {tx.date} • {tx.time}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{tx.toAmount}</p>
                                <p className="text-xs text-zinc-500">
                                  {tx.fromAmount} {tx.fromCurrency}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
                                Processing
                              </span>
                              <div className="flex items-center">
                                <span className="text-xs text-zinc-500 mr-1">{tx.paymentMethod}</span>
                                <ExternalLink className="h-3 w-3 text-zinc-500" />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-center text-zinc-500">
                      <div>
                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No processing transactions</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="pt-4">
                  {filteredTransactions.filter((tx) => tx.status === "completed").length > 0 ? (
                    <div className="space-y-4">
                      {filteredTransactions
                        .filter((tx) => tx.status === "completed")
                        .map((tx) => (
                          <div
                            key={tx.id}
                            className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                            onClick={() => handleTransactionClick(tx)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                                  <ArrowDown className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {tx.fromCurrency} to {tx.toCurrency}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {tx.date} • {tx.time}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{tx.toAmount}</p>
                                <p className="text-xs text-zinc-500">
                                  {tx.fromAmount} {tx.fromCurrency}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                                Completed
                              </span>
                              <div className="flex items-center">
                                <span className="text-xs text-zinc-500 mr-1">{tx.paymentMethod}</span>
                                <ExternalLink className="h-3 w-3 text-zinc-500" />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-center text-zinc-500">
                      <div>
                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No completed transactions</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <DashboardHeader />

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Transaction ID: {selectedTransaction?.id}</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 pt-2">
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400">Status</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedTransaction.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {selectedTransaction.status === "completed" ? "Completed" : "Processing"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400">Date & Time</span>
                  <span className="text-sm">
                    {selectedTransaction.date} • {selectedTransaction.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Processing Time</span>
                  <span className="text-sm">{selectedTransaction.completedTime}</span>
                </div>
                {selectedTransaction.status === "processing" && (
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-zinc-400">Estimated Completion</span>
                    <span className="text-sm">{selectedTransaction.estimatedCompletion}</span>
                  </div>
                )}
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Conversion Details</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400">From</span>
                  <span className="text-sm">
                    {selectedTransaction.fromAmount} {selectedTransaction.fromCurrency}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400">To</span>
                  <span className="text-sm">₹{selectedTransaction.toAmount}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400">Conversion Rate</span>
                  <span className="text-sm">₹{selectedTransaction.conversionRate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Platform Fee (2%)</span>
                  <span className="text-sm">₹{selectedTransaction.platformFee}</span>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Payment Details</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-zinc-400">Method</span>
                  <span className="text-sm">{selectedTransaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Details</span>
                  <span className="text-sm">{selectedTransaction.paymentDetails}</span>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Blockchain Details</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Transaction Hash</span>
                  <div className="flex items-center">
                    <span className="text-sm text-blue-400 mr-1">{selectedTransaction.txHash}</span>
                    <ExternalLink className="h-3 w-3 text-blue-400" />
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Download Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
