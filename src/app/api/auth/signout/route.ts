import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      // Clear any session data from the database
      const pool = createPool();
      await pool.query(
        'DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = $1)',
        [session.user.email]
      );
    }

    const response = new NextResponse(
      JSON.stringify({ message: 'Successfully signed out' }),
      { status: 200 }
    );

    // Clear cookies
    response.cookies.set('next-auth.session-token', '', { expires: new Date(0) });
    response.cookies.set('next-auth.csrf-token', '', { expires: new Date(0) });
    response.cookies.set('next-auth.callback-url', '', { expires: new Date(0) });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error during signout' }),
      { status: 500 }
    );
  }
} 