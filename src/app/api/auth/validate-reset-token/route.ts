import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    const pool = createPool();
    
    // Check if token exists and is not expired
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Token válido' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 