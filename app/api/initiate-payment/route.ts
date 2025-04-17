import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    // Store payment details in a cookie
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