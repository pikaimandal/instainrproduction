import { NextRequest, NextResponse } from 'next/server';
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js';
import { findOrCreateUserByWalletAddress } from '@/lib/services/userService';
import { isUserProfileComplete } from '@/lib/services/userService';

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IRequestPayload = await request.json();
    
    // Extract nonce from cookie
    const storedNonce = request.cookies.get('siwe-nonce')?.value;
    
    if (!storedNonce || storedNonce !== body.nonce) {
      return NextResponse.json(
        { error: 'Invalid nonce. Please try again.' },
        { status: 400 }
      );
    }
    
    const result = await verifySiweMessage(body.payload, body.nonce);
    
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