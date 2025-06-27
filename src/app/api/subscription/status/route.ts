import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const pool = createPool();
    
    // Get user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Get subscription
    const subscriptionResult = await pool.query(
      'SELECT * FROM "UserSubscription" WHERE "userId" = $1',
      [user.id]
    );

    const subscription = subscriptionResult.rows[0] || null;

    return NextResponse.json({
      subscription: subscription,
    });
    
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 