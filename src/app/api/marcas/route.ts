import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';
import { getPlanById, getFreePlan } from '@/lib/subscription-plans';

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

    console.log('Fetching marcas for user:', session.user.email);
    const result = await pool.query(`
      SELECT 
        m.id,
        m.marca,
        m.renovar,
        m.vencimiento,
        m.djumt,
        m.titular_nombre,
        m.titular_email,
        m.titular_telefono,
        m.anotaciones,
        m.oposicion,
        m.clases,
        m.class_details,
        m.tipo_marca,
        m.titulares,
        m.created_at as "createdAt",
        m.updated_at as "updatedAt"
      FROM marcas m
      WHERE m.user_email = $1
      ORDER BY m.created_at DESC
    `, [session.user.email]);
    
    console.log('Raw marcas data:', JSON.stringify(result.rows[0], null, 2));
    console.log('Full marcas response:', {
      totalRows: result.rows.length,
      allMarcas: result.rows.map(row => ({
        id: row.id,
        marca: row.marca,
        renovar: row.renovar,
        vencimiento: row.vencimiento,
        djumt: row.djumt
      }))
    });

    const formattedMarcas = result.rows.map(marca => {
      try {
        console.log('Processing marca:', marca.id);
        
        // Use titulares from JSONB if present, else fallback to legacy fields
        const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
          ? marca.titulares
          : [{
              id: (marca.titular_email || marca.titular_nombre || 'default-titular-id'),
              fullName: marca.titular_nombre || '',
              email: marca.titular_email || '',
              phone: marca.titular_telefono || ''
            }];

        return {
          ...marca,
          titulares,
          titular: titulares[0] || { fullName: '', email: '', phone: '' },
          anotacion: Array.isArray(marca.anotaciones) 
            ? marca.anotaciones.map((text: string) => ({ 
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
          clases: Array.isArray(marca.clases) ? marca.clases : [],
          tipoMarca: marca.tipo_marca || 'denominativa',
          classDetails: marca.class_details || {},
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
    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
    }

    const body = await request.json();
    const { marca, renovar, vencimiento, djumt, titulares, anotacion, oposicion, tipoMarca, clases, classDetails } = body;

    console.log('🔍 API received classDetails:', {
      classDetails,
      hasClassDetails: !!classDetails,
      classDetailsKeys: classDetails ? Object.keys(classDetails) : [],
      clases,
      selectedClases: clases
    });

    // Validate required fields
    if (!marca || !renovar || !vencimiento || !djumt || !titulares || !Array.isArray(titulares) || titulares.length === 0) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validate first titular (required)
    const firstTitular = titulares[0];
    if (!firstTitular.fullName || !firstTitular.email) {
      return NextResponse.json({ message: 'El primer titular debe tener nombre y email' }, { status: 400 });
    }

    // Clean arrays
    const cleanedAnotaciones = Array.isArray(anotacion) 
      ? anotacion.map(note => note.text).filter(text => text !== '')
      : [];
    const cleanedOposicion = Array.isArray(oposicion) ? oposicion : [];

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

    // Fetch current clases if not provided
    let clasesToSave = clases;
    if (typeof clases === 'undefined') {
      const current = await pool.query('SELECT clases FROM marcas WHERE id = $1', [id]);
      if (current.rows.length > 0) {
        clasesToSave = current.rows[0].clases || [];
      } else {
        clasesToSave = [];
      }
    }

    // Update the marca - store first titular in legacy fields, all titulares as JSON
    await pool.query(`
      UPDATE marcas 
      SET 
        marca = $1,
        renovar = $2,
        vencimiento = $3,
        djumt = $4,
        titular_nombre = $5,
        titular_email = $6,
        titular_telefono = $7,
        anotaciones = $8::text[],
        oposicion = $9::jsonb,
        tipo_marca = $10,
        clases = $11::integer[],
        class_details = $12::jsonb,
        titulares = $13::jsonb,
        updated_at = NOW()
      WHERE id = $14 AND user_email = $15
      RETURNING *
    `, [
      marca,
      renovar,
      vencimiento,
      djumt,
      firstTitular.fullName,
      firstTitular.email,
      firstTitular.phone || '',
      cleanedAnotaciones,
      JSON.stringify(cleanedOposicion),
      tipoMarca,
      Array.isArray(clasesToSave) ? clasesToSave : [],
      JSON.stringify(classDetails || {}),
      JSON.stringify(titulares),
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

    const pool = createPool();

    // Fetch user id
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    // Fetch subscription tier
    const subResult = await pool.query('SELECT tier FROM "UserSubscription" WHERE "userId" = $1', [userId]);
    const tier = subResult.rows.length > 0 ? subResult.rows[0].tier : 'free';
    const plan = getPlanById(tier) || getFreePlan();

    // Count current marcas for this user
    const countResult = await pool.query('SELECT COUNT(*) FROM marcas WHERE user_email = $1', [session.user.email]);
    const marcaCount = parseInt(countResult.rows[0].count, 10);
    if (plan.marcaLimit !== -1 && marcaCount >= plan.marcaLimit) {
      return NextResponse.json({ message: 'Has alcanzado el límite de marcas para tu plan. Actualiza tu suscripción para agregar más.' }, { status: 403 });
    }

    const { 
      marca, 
      renovar, 
      vencimiento, 
      djumt,
      titulares,
      anotacion = [],
      oposicion = [],
      clases = [],
      tipoMarca,
      classDetails = {}
    } = await request.json();

    // Validate titulares
    if (!titulares || !Array.isArray(titulares) || titulares.length === 0) {
      return NextResponse.json({ message: 'Debe proporcionar al menos un titular' }, { status: 400 });
    }

    // Validate first titular (required)
    const firstTitular = titulares[0];
    if (!firstTitular.fullName || !firstTitular.email) {
      return NextResponse.json({ message: 'El primer titular debe tener nombre y email' }, { status: 400 });
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

    // Insert the new marca - store first titular in legacy fields, all titulares as JSON
    const result = await pool.query(`
      INSERT INTO marcas (
        marca,
        renovar,
        vencimiento,
        djumt,
        titular_nombre,
        titular_email,
        titular_telefono,
        anotaciones,
        oposicion,
        tipo_marca,
        clases,
        class_details,
        titulares,
        user_email
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8::text[], $9::jsonb, $10, $11::integer[], $12::jsonb, $13::jsonb, $14
      )
      RETURNING id
    `, [
      marca,
      renovar,
      vencimiento,
      djumt,
      firstTitular.fullName,
      firstTitular.email,
      firstTitular.phone || '',
      cleanedAnotaciones,
      JSON.stringify(cleanedOposicion),
      tipoMarca,
      Array.isArray(clases) ? clases : [],
      JSON.stringify(classDetails || {}),
      JSON.stringify(titulares),
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