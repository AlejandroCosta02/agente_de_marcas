import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth/');
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth/');
    const isPublicPage = req.nextUrl.pathname === '/';

    // For auth pages, redirect to dashboard if already authenticated
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // For public pages and auth pages, allow access without authentication
    if (isPublicPage || isAuthPage || isApiAuthRoute) {
      return NextResponse.next();
    }

    // For all other pages, require authentication
    if (!isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/marcas/:path*',
    '/api/migrations/:path*',
    '/migrate'
  ],
};