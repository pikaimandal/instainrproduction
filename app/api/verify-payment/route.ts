import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTransactionByReferenceId, updateTransactionStatus } from '@/lib/services/transactionService'

// Worldcoin Developer Portal API Key - in a real app, this should be in an environment variable
const DEV_PORTAL_API_KEY = 'wld_dev_api_key'
const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { transactionId } = await req.json()
    
    if (!transactionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction ID is required' 
      }, { status: 400 })
    }
    
    // Get the payment details from the cookie
    const cookieStore = cookies()
    const paymentDetailsCookie = cookieStore.get('payment_details')
    
    if (!paymentDetailsCookie) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment session expired or not found' 
      }, { status: 400 })
    }
    
    const paymentDetails = JSON.parse(paymentDetailsCookie.value)
    
    // Find the transaction in our database
    const dbTransaction = await getTransactionByReferenceId(paymentDetails.referenceId)
    if (!dbTransaction) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction not found in database' 
      }, { status: 404 })
    }
    
    // Verify the transaction with Worldcoin Developer Portal
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${APP_ID}&type=payment`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DEV_PORTAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const transaction = await response.json()
    
    // Verify the transaction details match what we stored
    if (transaction.reference === paymentDetails.referenceId && 
        transaction.transaction_status !== 'failed') {
      
      // Update transaction status in our database
      const status = transaction.transaction_status === 'success' ? 'success' : 'pending'
      const updatedTransaction = await updateTransactionStatus(
        paymentDetails.referenceId,
        status,
        transaction.transaction_hash
      )
      
      if (!updatedTransaction) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to update transaction status' 
        }, { status: 500 })
      }
      
      // Clear the payment cookie as it's no longer needed
      const response = NextResponse.json({ 
        success: true,
        transaction: {
          id: updatedTransaction.id,
          status: updatedTransaction.status,
          hash: updatedTransaction.transaction_hash,
          token: updatedTransaction.token_symbol,
          amount: updatedTransaction.token_amount,
          from: updatedTransaction.sender_wallet_address,
          to: updatedTransaction.recipient_address,
          timestamp: updatedTransaction.updated_at
        }
      })
      
      response.cookies.set({
        name: 'payment_details',
        value: '',
        expires: new Date(0),
        path: '/'
      })
      
      return response
    } else {
      // Update transaction as failed in our database
      await updateTransactionStatus(paymentDetails.referenceId, 'failed')
      
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction verification failed' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify payment' 
    }, { status: 500 })
  }
} 