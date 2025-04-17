import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getUserByWalletAddress } from '@/lib/services/userService'
import { createTransaction } from '@/lib/services/transactionService'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, token, wallet } = body

    // Validate required fields
    if (!amount || !token || !wallet) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 })
    }

    // Generate unique reference ID
    const referenceId = uuidv4()

    // Find user ID from wallet address
    const user = await getUserByWalletAddress(wallet)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Create a transaction record in pending state
    const transaction = await createTransaction({
      user_id: user.id,
      reference_id: referenceId,
      sender_wallet_address: wallet,
      recipient_address: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || '',
      token_symbol: token,
      token_amount: amount,
      status: 'pending'
    })

    if (!transaction) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create transaction record' 
      }, { status: 500 })
    }

    // Store payment details in a cookie for verification
    const paymentDetails = {
      referenceId,
      amount,
      token,
      wallet,
      timestamp: Date.now()
    }

    // Set the cookie with the payment details
    cookies().set({
      name: 'payment_details',
      value: JSON.stringify(paymentDetails),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600, // 1 hour
      path: '/'
    })

    return NextResponse.json({ 
      success: true, 
      referenceId 
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to initiate payment' 
    }, { status: 500 })
  }
} 