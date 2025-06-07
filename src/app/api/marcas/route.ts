import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM marcas 
      WHERE user_email = ${session.user.email}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching marcas:', error);
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      marca,
      acta,
      resolucion,
      renovar,
      vencimiento,
      titular,
      anotaciones,
      oposicion
    } = body;

    // Validate required fields
    if (!marca || !acta || !resolucion || !renovar || !vencimiento || !titular.fullName || !titular.email || !titular.phone) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { message: 'Error de configuración: Falta la conexión a la base de datos' },
        { status: 500 }
      );
    }

    // Create the marca
    const result = await sql`
      INSERT INTO marcas (
        marca,
        acta,
        resolucion,
        renovar,
        vencimiento,
        titular_nombre,
        titular_email,
        titular_telefono,
        anotaciones,
        oposicion,
        user_email
      ) VALUES (
        ${marca},
        ${acta},
        ${resolucion},
        ${renovar},
        ${vencimiento},
        ${titular.fullName},
        ${titular.email},
        ${titular.phone},
        ${JSON.stringify(anotaciones)},
        ${oposicion},
        ${session.user.email}
      )
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating marca:', error);
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
} 