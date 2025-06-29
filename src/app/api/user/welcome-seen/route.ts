import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const pool = createPool();
    
    // Mark welcome message as seen
    await pool.query(
      'UPDATE users SET welcome_seen = TRUE WHERE id = $1',
      [session.user.id]
    );

    return NextResponse.json(
      { message: 'Welcome message marked as seen' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking welcome as seen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const pool = createPool();
    
    // Check if user has seen welcome message
    const { rows } = await pool.query(
      'SELECT welcome_seen FROM users WHERE id = $1',
      [session.user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { welcome_seen: rows[0].welcome_seen || false },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking welcome status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 