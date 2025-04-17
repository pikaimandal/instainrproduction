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
      // Find or create the user in Supabase based on wallet address
      const user = await findOrCreateUserByWalletAddress(body.payload.address);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Failed to create user record.' },
          { status: 500 }
        );
      }

      // Clear nonce cookie after successful verification
      const response = NextResponse.json({ 
        success: true,
        address: body.payload.address,
        userId: user.id,
        isProfileComplete: isUserProfileComplete(user),
        isNewUser: user.full_name === 'New User'
      });
      
      response.cookies.set({
        name: 'siwe-nonce',
        value: '',
        expires: new Date(0),
        path: '/'
      });
      
      return response;
    } else {
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error during verification:', error);
    return NextResponse.json(
      { error: 'Server error during verification.' },
      { status: 500 }
    );
  }
}