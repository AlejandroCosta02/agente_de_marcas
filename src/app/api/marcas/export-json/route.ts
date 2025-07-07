import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

const pool = createPool();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Fetch all marcas for the authenticated user
    const result = await pool.query(
      `SELECT * FROM marcas WHERE user_email = $1 ORDER BY created_at DESC`,
      [session.user.email]
    );

    // Only include marcas belonging to the user
    const marcas = result.rows;

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(marcas, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="marcas.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting marcas as JSON:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 