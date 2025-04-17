import { NextRequest, NextResponse } from 'next/server';
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js';
import { findOrCreateUserByWalletAddress } from '@/lib/services/userService';
import { isUserProfileComplete } from '@/lib/services/userService';
import { isSupabaseInitialized } from '@/lib/supabase';

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if database is available
    if (!isSupabaseInitialized()) {
      console.error('Supabase is not initialized - cannot complete authentication');
      return NextResponse.json(
        { error: 'Database service unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Parse request body
    let body: IRequestPayload;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format.' },
        { status: 400 }
      );
    }
    
    // Extract nonce from cookie
    const storedNonce = request.cookies.get('siwe-nonce')?.value;
    
    if (!storedNonce || storedNonce !== body.nonce) {
      return NextResponse.json(
        { error: 'Invalid nonce. Please try again.' },
        { status: 400 }
      );
    }
    
    let result;
    try {
      result = await verifySiweMessage(body.payload, body.nonce);
    } catch (verifyError) {
      console.error('Error during SIWE verification:', verifyError);
      return NextResponse.json(
        { error: 'Error during message verification. Please try again.' },
        { status: 500 }
      );
    }
    
    if (result.isValid) {
      try {
        // Find or create the user in Supabase based on wallet address
        const user = await findOrCreateUserByWalletAddress(body.payload.address);
        
        if (!user) {
          return NextResponse.json(
            { error: 'Failed to create user record. Please try again later.' },
            { status: 500 }
          );
        }

        // Create response object
        const response = NextResponse.json({ 
          success: true,
          address: body.payload.address,
          userId: user.id,
          isProfileComplete: isUserProfileComplete(user),
          isNewUser: user.full_name === 'New User'
        });
        
        // Clear nonce cookie
        response.cookies.set({
          name: 'siwe-nonce',
          value: '',
          expires: new Date(0),
          path: '/'
        });
        
        return response;
      } catch (dbError) {
        console.error('Database error during user creation:', dbError);
        return NextResponse.json(
          { error: 'Server error while accessing user data. Please try again later.' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error during verification:', error);
    return NextResponse.json(
      { error: 'Server error during verification. Please try again later.' },
      { status: 500 }
    );
  }
}