import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    try {
      console.log('Middleware - Processing request:', req.nextUrl.pathname);
      
      const token = await getToken({ req });
      console.log('Middleware - Token state:', { exists: !!token });
      
      const isAuth = !!token;
      const isAuthPage = req.nextUrl.pathname.startsWith('/login');
      const isApiRequest = req.nextUrl.pathname.startsWith('/api/');
      const isMigratePage = req.nextUrl.pathname.startsWith('/migrate');

      // Allow access to auth page only if not authenticated
      if (isAuthPage || isMigratePage) {
        if (isAuth) {
          console.log('Middleware - Redirecting authenticated user from auth/migrate page to dashboard');
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        console.log('Middleware - Allowing access to auth/migrate page for unauthenticated user');
        return null;
      }

      if (!isAuth) {
        console.log('Middleware - Unauthorized access attempt:', req.nextUrl.pathname);
        if (isApiRequest) {
          return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }
        
        let from = req.nextUrl.pathname;
        if (req.nextUrl.search) {
          from += req.nextUrl.search;
        }

        console.log('Middleware - Redirecting to login with from:', from);
        return NextResponse.redirect(
          new URL(`/?from=${encodeURIComponent(from)}`, req.url)
        );
      }

      console.log('Middleware - Allowing access to:', req.nextUrl.pathname);
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware - Error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
      }
      
      return NextResponse.redirect(new URL('/?error=ServerError', req.url));
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
    '/dashboard/:path*',
    '/api/marcas/:path*',
    '/api/migrations/:path*',
    '/login',
    '/migrate'
  ],
}; 