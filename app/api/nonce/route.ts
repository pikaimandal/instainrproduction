import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const nonce = uuidv4();
  
  // Create response with nonce
  const response = NextResponse.json({ nonce });
  
  // Set nonce in a cookie using response headers
  response.cookies.set({
    name: 'siwe-nonce',
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
    sameSite: 'strict'
  });

  return response;
} 