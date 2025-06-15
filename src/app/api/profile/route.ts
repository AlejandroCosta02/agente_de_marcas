import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.error('No session or user email found', { session });
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const pool = createPool();
    const { rows } = await pool.query(
      `SELECT id, name, email FROM users WHERE email = $1`,
      [session.user.email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ profile: rows[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    const pool = createPool();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE users SET
        name = $1,
        updated_at = NOW()
       WHERE email = $2`,
      [
        data.name,
        session.user.email,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 