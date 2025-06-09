import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('No session or user email found');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Test database connection
    try {
      await sql`SELECT 1`;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ message: 'Error de conexión a la base de datos' }, { status: 500 });
    }

    const marcas = await sql`
      SELECT 
        id,
        marca,
        acta,
        resolucion,
        renovar,
        vencimiento,
        titular_nombre as "titular.fullName",
        titular_email as "titular.email",
        titular_telefono as "titular.phone",
        anotaciones as anotacion,
        oposicion,
        tipo_marca as "tipoMarca",
        clases,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM marcas 
      WHERE user_email = ${session.user.email}
      ORDER BY created_at DESC
    `;

    const formattedMarcas = marcas.rows.map(marca => ({
      ...marca,
      anotacion: marca.anotacion?.map((text: string) => ({ id: Math.random().toString(36).substr(2, 9), text })) || [],
      oposicion: Array.isArray(marca.oposicion) ? marca.oposicion : [],
      clases: Array.isArray(marca.clases) ? marca.clases : []
    }));

    return NextResponse.json(formattedMarcas);
  } catch (error) {
    console.error('Error detallado al obtener marcas:', error);
    return NextResponse.json({ 
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
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
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { 
      id,
      marca, 
      acta, 
      resolucion, 
      renovar, 
      vencimiento, 
      titular,
      anotacion = [],
      oposicion = [],
      clases = [],
      tipoMarca
    } = await request.json();

    // Clean and validate anotaciones
    const cleanedAnotaciones = Array.isArray(anotacion) 
      ? anotacion.map(note => {
          if (typeof note === 'string') return note.trim();
          return note.text.trim();
        }).filter(note => note !== '')
      : [];

    // Clean and validate oposiciones
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
    const clasesArray = `{${clases.join(',')}}`;

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
        tipo_marca = ${tipoMarca},
        clases = ${clasesArray}::integer[],
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
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { 
      marca, 
      acta, 
      resolucion, 
      renovar, 
      vencimiento, 
      titular,
      anotacion = [],
      oposicion = [],
      clases = [],
      tipoMarca
    } = await request.json();

    // Clean and validate anotaciones
    const cleanedAnotaciones = Array.isArray(anotacion) 
      ? anotacion.map(note => {
          if (typeof note === 'string') return note.trim();
          return note.text.trim();
        }).filter(note => note !== '')
      : [];

    // Clean and validate oposiciones
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
    const clasesArray = `{${clases.join(',')}}`;

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
        tipo_marca,
        clases,
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
        ${tipoMarca},
        ${clasesArray}::integer[],
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