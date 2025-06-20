import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

// Temporarily disable middleware to test login flow
export default function middleware(req: any) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/api/marcas/:path*',
    '/api/migrations/:path*',
    '/migrate'
  ],
};