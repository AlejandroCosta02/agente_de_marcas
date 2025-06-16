import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isPublicPage = request.nextUrl.pathname === '/';
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');

  // Always clear session cookies for auth pages
  if (isAuthPage) {
    const response = NextResponse.next();
    // Clear all auth-related cookies
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('next-auth.callback-url');
    response.cookies.delete('next-auth.session');
    response.cookies.delete('next-auth.callback-url');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.session-token.sig');
    response.cookies.delete('next-auth.csrf-token.sig');
    return response;
  }

  // If no token, handle unauthenticated state
  if (!token) {
    // Allow access to public pages and auth pages
    if (isPublicPage || isAuthPage || isApiAuthRoute) {
      return NextResponse.next();
    }
    // Redirect to login for all other pages
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If has token, handle authenticated state
  if (token) {
    // Redirect to dashboard if trying to access auth pages
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to all other pages
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
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