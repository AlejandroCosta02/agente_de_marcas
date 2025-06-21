import { NextResponse } from 'next/server';

// Temporarily disable middleware to test login flow
export default function middleware() {
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