import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
    }
  }
  interface User {
    id: string;
    email: string;
    name?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales requeridas');
        }

        const pool = createPool();
        const { rows } = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [credentials.email]
        );

        if (rows.length === 0) {
          throw new Error('Usuario no encontrado');
        }

        const user = rows[0];
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Contraseña incorrecta');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: '.agente-de-marcas.vercel.app',
      },
    },
  },
};

// export default withAuth(
//   async function middleware(req) {
//     const token = await getToken({ req });
//     const isAuth = !!token;
//     const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth/');

//     // Allow NextAuth API routes
//     if (isApiAuthRoute) {
//       return NextResponse.next();
//     }

//     // If not authenticated, redirect to login
//     if (!isAuth) {
//       return NextResponse.redirect(new URL('/auth/login', req.url));
//     }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//   }
// );

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/api/marcas/:path*',
//     '/api/migrations/:path*',
//     '/migrate'
//   ],
// }; 