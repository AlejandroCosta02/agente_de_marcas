import { NextAuthOptions } from 'next-auth';
import { neon } from '@neondatabase/serverless';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  name: string;
}

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

if (!process.env.POSTGRES_URL) {
  throw new Error('Please define the POSTGRES_URL environment variable');
}

const sql = neon(process.env.POSTGRES_URL);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const users = await sql`
            SELECT * FROM users WHERE email = ${credentials.email}
          `;

          const user = users[0];

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) {
            return null;
          }

          const userWithoutPassword: User = {
            id: user.id,
            email: user.email,
            name: user.name
          };

          return userWithoutPassword;
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as SessionUser).id = token.id as string;
      }
      return session;
    }
  }
}; 