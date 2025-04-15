import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export function GET(req: NextRequest) {
  // Generate a nonce (at least 8 alphanumeric characters)
  const nonce = crypto.randomUUID().replace(/-/g, "")

  // Store the nonce in a secure cookie
  cookies().set("siwe", nonce, { secure: true })
  
  return NextResponse.json({ nonce })
} 