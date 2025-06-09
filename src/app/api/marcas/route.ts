import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    console.log('GET /api/marcas - Starting request');
    
    const session = await getServerSession(authOptions);
    console.log('Session state:', {
      exists: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email
    });

    if (!session?.user?.email) {
      console.error('No session or user email found');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Test database connection
    try {
      console.log('Testing database connection...');
      await sql`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection error:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined
      });
      return NextResponse.json({ message: 'Error de conexión a la base de datos' }, { status: 500 });
    }

    console.log('Fetching marcas for user:', session.user.email);
    const marcas = await sql`
      SELECT 
        m.id,
        m.marca,
        m.acta,
        m.resolucion,
        m.renovar,
        m.vencimiento,
        m.titular_nombre as "titular.fullName",
        m.titular_email as "titular.email",
        m.titular_telefono as "titular.phone",
        m.anotaciones as anotacion,
        m.oposicion,
        m.tipo_marca as "tipoMarca",
        COALESCE(m.clases, ARRAY[]::INTEGER[]) as clases,
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM marcas m
      WHERE m.user_email = ${session.user.email}
      ORDER BY m.created_at DESC
    `;
    
    console.log('Raw marcas data:', JSON.stringify(marcas.rows[0], null, 2));

    const formattedMarcas = marcas.rows.map(marca => {
      try {
        console.log('Processing marca:', marca.id);
        return {
          ...marca,
          anotacion: Array.isArray(marca.anotacion) 
            ? marca.anotacion.map((text: string) => ({ 
                id: Math.random().toString(36).substr(2, 9), 
                text,
                date: new Date().toISOString()
              })) 
            : [],
          oposicion: Array.isArray(marca.oposicion) 
            ? marca.oposicion 
            : typeof marca.oposicion === 'object' && marca.oposicion !== null
              ? Object.values(marca.oposicion)
              : [],
          clases: Array.isArray(marca.clases) 
            ? marca.clases.map(Number).filter(n => !isNaN(n))
            : [],
          tipoMarca: marca.tipoMarca || 'denominativa'
        };
      } catch (formatError) {
        console.error('Error formatting marca:', {
          marcaId: marca.id,
          error: formatError,
          rawData: marca
        });
        throw formatError;
      }
    });

    console.log('Successfully formatted marcas data');
    return NextResponse.json(formattedMarcas);
  } catch (error) {
    console.error('Detailed error in GET /api/marcas:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    return NextResponse.json({ 
      message: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      type: error instanceof Error ? error.constructor.name : typeof error
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