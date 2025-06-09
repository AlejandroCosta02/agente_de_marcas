import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

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

    const pool = createPool();

    // Test database connection
    try {
      console.log('Testing database connection...');
      await pool.query('SELECT 1');
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection error:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined
      });
      return NextResponse.json({ message: 'Error de conexión a la base de datos' }, { status: 500 });
    }

    // Check if required columns exist
    try {
      const columnsExist = await pool.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'marcas' 
          AND column_name = 'tipo_marca'
        ) as has_tipo_marca,
        EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'marcas' 
          AND column_name = 'clases'
        ) as has_clases;
      `);

      if (!columnsExist.rows[0].has_tipo_marca || !columnsExist.rows[0].has_clases) {
        return NextResponse.json({ 
          message: 'Error interno del servidor',
          details: 'Database needs migration',
          needsMigration: true
        }, { status: 500 });
      }
    } catch (error) {
      console.error('Error checking columns:', error);
    }

    console.log('Fetching marcas for user:', session.user.email);
    const result = await pool.query(`
      SELECT 
        m.id,
        m.marca,
        m.acta,
        m.resolucion,
        m.renovar,
        m.vencimiento,
        m.titular_nombre,
        m.titular_email,
        m.titular_telefono,
        m.anotaciones as anotacion,
        m.oposicion,
        COALESCE(m.tipo_marca, 'denominativa') as "tipoMarca",
        COALESCE(m.clases, ARRAY[]::INTEGER[]) as clases,
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM marcas m
      WHERE m.user_email = $1
      ORDER BY m.created_at DESC
    `, [session.user.email]);
    
    console.log('Raw marcas data:', JSON.stringify(result.rows[0], null, 2));

    const formattedMarcas = result.rows.map(marca => {
      try {
        console.log('Processing marca:', marca.id);
        return {
          ...marca,
          titular: {
            fullName: marca.titular_nombre,
            email: marca.titular_email,
            phone: marca.titular_telefono
          },
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
            ? marca.clases.map((n: number) => Number(n)).filter((n: number) => !isNaN(n))
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
    console.error('Error fetching marcas:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await request.json();
    const pool = createPool();

    // First verify the marca belongs to the user
    const verifyResult = await pool.query(`
      SELECT user_email FROM marcas WHERE id = $1
    `, [id]);

    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ message: 'Marca no encontrada' }, { status: 404 });
    }

    if (verifyResult.rows[0].user_email !== session.user.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Delete the marca
    await pool.query(`
      DELETE FROM marcas WHERE id = $1 AND user_email = $2
    `, [id, session.user.email]);

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

    const pool = createPool();

    // First verify the marca belongs to the user
    const verifyResult = await pool.query(`
      SELECT user_email FROM marcas WHERE id = $1
    `, [id]);

    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ message: 'Marca no encontrada' }, { status: 404 });
    }

    if (verifyResult.rows[0].user_email !== session.user.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

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

    // Update the marca
    await pool.query(`
      UPDATE marcas 
      SET 
        marca = $1,
        acta = $2,
        resolucion = $3,
        renovar = $4,
        vencimiento = $5,
        titular_nombre = $6,
        titular_email = $7,
        titular_telefono = $8,
        anotaciones = $9::text[],
        oposicion = $10::jsonb,
        tipo_marca = $11,
        clases = $12::integer[],
        updated_at = NOW()
      WHERE id = $13 AND user_email = $14
    `, [
      marca,
      parseInt(acta, 10),
      parseInt(resolucion, 10),
      renovar,
      vencimiento,
      titular.fullName,
      titular.email,
      titular.phone,
      cleanedAnotaciones,
      JSON.stringify(cleanedOposicion),
      tipoMarca,
      clases,
      id,
      session.user.email
    ]);

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

    const pool = createPool();

    // Insert the new marca
    const result = await pool.query(`
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
        $1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10::jsonb, $11, $12::integer[], $13
      )
      RETURNING id
    `, [
      marca,
      parseInt(acta, 10),
      parseInt(resolucion, 10),
      renovar,
      vencimiento,
      titular.fullName,
      titular.email,
      titular.phone,
      cleanedAnotaciones,
      JSON.stringify(cleanedOposicion),
      tipoMarca,
      clases,
      session.user.email
    ]);

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