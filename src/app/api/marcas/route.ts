import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET() {
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID de marca no proporcionado' }, { status: 400 });
    }

    // First verify the marca belongs to the user
    const verifyResult = await sql`
      SELECT user_email FROM marcas WHERE id = ${id}
    `;

    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ message: 'Marca no encontrada' }, { status: 404 });
    }

    if (verifyResult.rows[0].user_email !== session.user.email) {
      return NextResponse.json({ message: 'No autorizado para eliminar esta marca' }, { status: 403 });
    }

    // Delete the marca
    await sql`
      DELETE FROM marcas WHERE id = ${id} AND user_email = ${session.user.email}
    `;

    return NextResponse.json({ message: 'Marca eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting marca:', error);
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID de marca no proporcionado' }, { status: 400 });
    }

    const data = await request.json();
    const {
      marca,
      acta,
      resolucion,
      renovar,
      vencimiento,
      titular,
      anotaciones = [],
      oposicion = []
    } = data;

    // Validate required fields
    if (!marca || !acta || !resolucion || !renovar || !vencimiento || !titular.fullName || !titular.email || !titular.phone) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validate marca length
    if (marca.length > 20) {
      return NextResponse.json({ message: 'La marca no puede tener más de 20 caracteres' }, { status: 400 });
    }

    // Validate acta and resolucion format
    if (!/^N\d+$/.test(acta)) {
      return NextResponse.json({ message: 'El acta debe comenzar con N seguido de números' }, { status: 400 });
    }
    if (!/^N\d+$/.test(resolucion)) {
      return NextResponse.json({ message: 'La resolución debe comenzar con N seguido de números' }, { status: 400 });
    }

    // Verify the marca belongs to the user
    const verifyResult = await sql`
      SELECT user_email FROM marcas WHERE id = ${id}
    `;

    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ message: 'Marca no encontrada' }, { status: 404 });
    }

    if (verifyResult.rows[0].user_email !== session.user.email) {
      return NextResponse.json({ message: 'No autorizado para editar esta marca' }, { status: 403 });
    }

    // Clean arrays
    const cleanedAnotaciones = Array.isArray(anotaciones) 
      ? anotaciones.filter(note => note && note.trim() !== '').map(note => note.trim())
      : [];
    const cleanedOposicion = Array.isArray(oposicion)
      ? oposicion.filter(op => op && op.trim() !== '').map(op => op.trim())
      : [];

    // Convert arrays to PostgreSQL format
    const anotacionesArray = `{${cleanedAnotaciones.map(note => `"${note.replace(/"/g, '\\"')}"`).join(',')}}`;
    const oposicionArray = `{${cleanedOposicion.map(op => `"${op.replace(/"/g, '\\"')}"`).join(',')}}`;

    // Update the marca
    await sql`
      UPDATE marcas 
      SET 
        marca = ${marca},
        acta = ${acta},
        resolucion = ${resolucion},
        renovar = ${renovar},
        vencimiento = ${vencimiento},
        titular_nombre = ${titular.fullName},
        titular_email = ${titular.email},
        titular_telefono = ${titular.phone},
        anotaciones = ${anotacionesArray}::text[],
        oposicion = ${oposicionArray}::text[],
        updated_at = NOW()
      WHERE id = ${id} AND user_email = ${session.user.email}
    `;

    return NextResponse.json({ message: 'Marca actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating marca:', error);
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
      anotaciones = [],
      oposicion = []
    } = body;

    // Validate required fields
    if (!marca || !acta || !resolucion || !renovar || !vencimiento || !titular.fullName || !titular.email || !titular.phone) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validate marca length
    if (marca.length > 20) {
      return NextResponse.json({ message: 'La marca no puede tener más de 20 caracteres' }, { status: 400 });
    }

    // Validate acta and resolucion format
    if (!/^N\d+$/.test(acta)) {
      return NextResponse.json({ message: 'El acta debe comenzar con N seguido de números' }, { status: 400 });
    }
    if (!/^N\d+$/.test(resolucion)) {
      return NextResponse.json({ message: 'La resolución debe comenzar con N seguido de números' }, { status: 400 });
    }

    // Clean arrays
    const cleanedAnotaciones = Array.isArray(anotaciones) 
      ? anotaciones.filter(note => note && note.trim() !== '').map(note => note.trim())
      : [];
    const cleanedOposicion = Array.isArray(oposicion)
      ? oposicion.filter(op => op && op.trim() !== '').map(op => op.trim())
      : [];

    // Convert arrays to PostgreSQL format
    const anotacionesArray = `{${cleanedAnotaciones.map(note => `"${note.replace(/"/g, '\\"')}"`).join(',')}}`;
    const oposicionArray = `{${cleanedOposicion.map(op => `"${op.replace(/"/g, '\\"')}"`).join(',')}}`;

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
        ${anotacionesArray}::text[],
        ${oposicionArray}::text[],
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