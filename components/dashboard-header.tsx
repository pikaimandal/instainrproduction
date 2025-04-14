"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Clock } from "lucide-react"

export default function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800">
      <div className="container max-w-md mx-auto">
        <nav className="flex items-center justify-between p-2">
          <Link href="/dashboard" className="flex flex-col items-center w-1/3">
            <div className={`p-1 ${pathname === "/dashboard" ? "text-blue-500" : "text-zinc-400"}`}>
              <Home className="h-6 w-6" />
            </div>
            <span className={`text-xs ${pathname === "/dashboard" ? "text-blue-500" : "text-zinc-400"}`}>Home</span>
          </Link>

          <Link href="/history" className="flex flex-col items-center w-1/3">
            <div className={`p-1 ${pathname.startsWith("/history") ? "text-blue-500" : "text-zinc-400"}`}>
              <Clock className="h-6 w-6" />
            </div>
            <span className={`text-xs ${pathname.startsWith("/history") ? "text-blue-500" : "text-zinc-400"}`}>
              History
            </span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center w-1/3">
            <div className={`p-1 ${pathname.startsWith("/profile") ? "text-blue-500" : "text-zinc-400"}`}>
              <User className="h-6 w-6" />
            </div>
            <span className={`text-xs ${pathname.startsWith("/profile") ? "text-blue-500" : "text-zinc-400"}`}>
              Profile
            </span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
