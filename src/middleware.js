// middleware.js
import { NextResponse } from 'next/server';

// Middleware function to check API key
export async function middleware(req) {
  // Skip middleware for non-API routes or auth routes if needed
  if (!req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.startsWith('/api/auth') || req.nextUrl.pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  // Get API key from request headers
  const apiKey = req.headers.get('x-api-key');

  // Verify API key
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API key' },
      { status: 401 }
    );
  }

  // If valid, proceed to the API route
  return NextResponse.next();
}

// Apply middleware to all API routes
export const config = {
  matcher: '/api/:path*', // Matches all /api routes
};