import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    try {
      const token = await getToken({ req });
      const isAuth = !!token;
      const isAuthPage = req.nextUrl.pathname.startsWith('/auth/');
      const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth/');
      const isApiRequest = req.nextUrl.pathname.startsWith('/api/');
      const isMigratePage = req.nextUrl.pathname.startsWith('/migrate');
      const isRootPage = req.nextUrl.pathname === '/';

      // Allow access to NextAuth API routes without redirection
      if (isApiAuthRoute) {
        return NextResponse.next();
      }

      // Allow access to auth pages only if not authenticated
      if (isAuthPage || isMigratePage || isRootPage) {
        if (isAuth) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
      }

      // Handle protected routes
      if (!isAuth) {
        if (isApiRequest) {
          return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }
        
        let from = req.nextUrl.pathname;
        if (req.nextUrl.search) {
          from += req.nextUrl.search;
        }

        return NextResponse.redirect(
          new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
        );
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware - Error:', error);
      
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
      }
      
      return NextResponse.redirect(new URL('/auth/login?error=ServerError', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/api/marcas/:path*',
    '/api/migrations/:path*',
    '/auth/:path*',
    '/migrate'
  ],
}; 