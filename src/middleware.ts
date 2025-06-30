import { NextResponse } from 'next/server';

// Temporarily disable middleware to test 404 page
export default function middleware() {
  // Temporarily disable middleware to test 404 page
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};