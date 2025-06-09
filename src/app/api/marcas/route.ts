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
      ORDER BY renovar ASC
    `;

    // Transform the results to match the frontend structure
    const transformedResults = result.rows.map(row => ({
      id: row.id,
      marca: row.marca,
      acta: row.acta,
      resolucion: row.resolucion,
      renovar: row.renovar,
      vencimiento: row.vencimiento,
      titular: {
        fullName: row.titular_nombre,
        email: row.titular_email,
        phone: row.titular_telefono
      },
      anotaciones: Array.isArray(row.anotaciones) ? row.anotaciones : [],
      oposicion: Array.isArray(row.oposicion) ? row.oposicion : [],
      user_email: row.user_email,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return NextResponse.json(transformedResults);
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
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
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

    // Validate acta and resolucion format (only numbers up to 8 digits)
    if (!/^\d{1,8}$/.test(acta)) {
      return NextResponse.json({ message: 'El acta debe ser un número de hasta 8 dígitos' }, { status: 400 });
    }
    if (!/^\d{1,8}$/.test(resolucion)) {
      return NextResponse.json({ message: 'La resolución debe ser un número de hasta 8 dígitos' }, { status: 400 });
    }

    // Ensure arrays are properly initialized
    const cleanedAnotaciones = Array.isArray(anotaciones) 
      ? anotaciones.filter(note => note && note.trim() !== '').map(note => note.trim())
      : [];
    const cleanedOposicion = Array.isArray(oposicion) 
      ? oposicion.map(op => {
          if (typeof op === 'string') {
            return { text: op.trim(), completed: false };
          }
          return {
            text: op.text.trim(),
            completed: !!op.completed
          };
        }).filter(op => op.text !== '')
      : [];

    // Convert arrays to PostgreSQL format
    const anotacionesArray = `{${cleanedAnotaciones.map(note => `"${note.replace(/"/g, '\\"')}"`).join(',')}}`;
    const oposicionJsonString = `[${cleanedOposicion.map(op => 
      JSON.stringify({ text: op.text, completed: op.completed })
    ).join(',')}]`;

    // Update the marca
    await sql`
      UPDATE marcas 
      SET 
        marca = ${marca},
        acta = ${parseInt(acta, 10)},
        resolucion = ${parseInt(resolucion, 10)},
        renovar = ${renovar},
        vencimiento = ${vencimiento},
        titular_nombre = ${titular.fullName},
        titular_email = ${titular.email},
        titular_telefono = ${titular.phone},
        anotaciones = ${anotacionesArray}::text[],
        oposicion = ${oposicionJsonString}::jsonb,
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

    // Validate acta and resolucion format (only numbers up to 8 digits)
    if (!/^\d{1,8}$/.test(acta)) {
      return NextResponse.json({ message: 'El acta debe ser un número de hasta 8 dígitos' }, { status: 400 });
    }
    if (!/^\d{1,8}$/.test(resolucion)) {
      return NextResponse.json({ message: 'La resolución debe ser un número de hasta 8 dígitos' }, { status: 400 });
    }

    // Ensure arrays are properly initialized
    const cleanedAnotaciones = Array.isArray(anotaciones) 
      ? anotaciones.filter(note => note && note.trim() !== '').map(note => note.trim())
      : [];
    const cleanedOposicion = Array.isArray(oposicion) 
      ? oposicion.map(op => {
          if (typeof op === 'string') {
            return { text: op.trim(), completed: false };
          }
          return {
            text: op.text.trim(),
            completed: !!op.completed
          };
        }).filter(op => op.text !== '')
      : [];

    // Convert arrays to PostgreSQL format
    const anotacionesArray = `{${cleanedAnotaciones.map(note => `"${note.replace(/"/g, '\\"')}"`).join(',')}}`;
    const oposicionJsonString = `[${cleanedOposicion.map(op => 
      JSON.stringify({ text: op.text, completed: op.completed })
    ).join(',')}]`;

    // Insert the new marca
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
        ${parseInt(acta, 10)},
        ${parseInt(resolucion, 10)},
        ${renovar},
        ${vencimiento},
        ${titular.fullName},
        ${titular.email},
        ${titular.phone},
        ${anotacionesArray}::text[],
        ${oposicionJsonString}::jsonb,
        ${session.user.email}
      )
      RETURNING id
    `;

    return NextResponse.json({ 
      message: 'Marca creada exitosamente',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error creating marca:', error);
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json({ message }, { status: 500 });
  }
} 