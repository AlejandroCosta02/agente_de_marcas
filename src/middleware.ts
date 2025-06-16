import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isPublicPage = request.nextUrl.pathname === '/';
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');

  // Clear any existing session cookies if accessing auth pages
  if (isAuthPage) {
    const response = NextResponse.next();
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('next-auth.callback-url');
    return response;
  }

  // Handle authentication state
  if (!token) {
    // If trying to access protected routes without token, redirect to login
    if (!isAuthPage && !isPublicPage && !isApiAuthRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // Allow access to auth pages and public pages
    return NextResponse.next();
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};