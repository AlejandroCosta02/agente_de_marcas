import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    console.error('No session or user email found', { session });
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const pool = createPool();
  const { rows } = await pool.query(
    `SELECT full_name, address, contact_email, contact_number, agent_number, province, zip_code
     FROM users WHERE email = $1`,
    [session.user.email]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ profile: rows[0] });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const data = await req.json();
  const pool = createPool();
  await pool.query(
    `UPDATE users SET
      full_name = $1,
      address = $2,
      contact_email = $3,
      contact_number = $4,
      agent_number = $5,
      province = $6,
      zip_code = $7,
      updated_at = NOW()
     WHERE email = $8`,
    [
      data.full_name,
      data.address,
      data.contact_email,
      data.contact_number,
      data.agent_number,
      data.province,
      data.zip_code,
      session.user.email,
    ]
  );
  return NextResponse.json({ ok: true });
} 