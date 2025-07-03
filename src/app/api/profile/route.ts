import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
      `SELECT id, name, email, address, contact_number, agent_number, province, zip_code FROM users WHERE email = $1`,
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

    if (!data.contact_number) {
      return NextResponse.json(
        { error: 'El teléfono de contacto es requerido' },
        { status: 400 }
      );
    }

    if (!data.agent_number) {
      return NextResponse.json(
        { error: 'El número de agente es requerido' },
        { status: 400 }
      );
    }

    if (!data.province) {
      return NextResponse.json(
        { error: 'La provincia es requerida' },
        { status: 400 }
      );
    }

    if (!data.zip_code) {
      return NextResponse.json(
        { error: 'El código postal es requerido' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE users SET
        name = $1,
        contact_number = $2,
        agent_number = $3,
        province = $4,
        zip_code = $5,
        address = $6,
        updated_at = NOW()
       WHERE email = $7`,
      [
        data.name,
        data.contact_number,
        data.agent_number,
        data.province,
        data.zip_code,
        data.address || null,
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