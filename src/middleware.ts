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

    // If authenticated, redirect away from auth pages
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If not authenticated, only redirect to login if not already on login or register
    if (!isAuth && !isAuthPage && !isPublicPage && !isApiAuthRoute) {
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