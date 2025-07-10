import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

export async function GET(_request: NextRequest) {
  let client;
  try {
    console.log('GET /api/leads - Starting request');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('GET /api/leads - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('GET /api/leads - Creating database client');
    client = createPool({
      connectionString: process.env.POSTGRES_URL
    });

    console.log('GET /api/leads - Connecting to database');
    
    // Add timeout to prevent hanging
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);

    console.log('GET /api/leads - Finding user:', session.user.email);
    // Get user by email
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      console.log('GET /api/leads - User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    console.log('GET /api/leads - User found, fetching leads for user ID:', user.id);

    // Get all leads for this user with timeout
    const leadsPromise = client.query(
      'SELECT * FROM "Lead" WHERE "userId" = $1 ORDER BY created_at DESC',
      [user.id]
    );
    
    const leadsResult = await Promise.race([
      leadsPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 15000)
      )
    ]) as { rows: unknown[] };

    console.log('GET /api/leads - Found', leadsResult.rows.length, 'leads');
    return NextResponse.json(leadsResult.rows);
  } catch (error) {
    console.error('GET /api/leads - Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  let client;
  try {
    console.log('POST /api/leads - Handler started');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('POST /api/leads - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _request.json();
    console.log('POST /api/leads - Request body:', body);
    const { nombre, direccion, website, socialMedia, whatsapp, email, futureContactDate } = body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      console.log('POST /api/leads - Nombre is required');
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    client = createPool({
      connectionString: process.env.POSTGRES_URL
    });
    console.log('POST /api/leads - Connecting to database');
    await client.connect();

    // Find user
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    console.log('POST /api/leads - User query result:', userResult.rows);
    if (userResult.rows.length === 0) {
      console.log('POST /api/leads - Usuario no encontrado');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    // Insert lead
    const now = new Date().toISOString();
    const insertResult = await client.query(
      `INSERT INTO "Lead" (nombre, direccion, website, "socialMedia", whatsapp, email, "userId", contacted, estado, "meetingSet", created_at, updated_at, "futureContactDate")
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, 'sin_respuesta', false, $8, $8, $9)
       RETURNING *`,
      [
        nombre,
        direccion || null,
        website || null,
        socialMedia || null,
        whatsapp || null,
        email || null,
        userId,
        now,
        futureContactDate || null
      ]
    );
    console.log('POST /api/leads - Lead inserted:', insertResult.rows[0]);
    return NextResponse.json(insertResult.rows[0]);
  } catch (error: unknown) {
    console.error('POST /api/leads - Error:', error);
    return NextResponse.json({ 
      error: 'Error al crear el lead', 
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest) {
  let client;
  try {
    console.log('PUT /api/leads - Handler started');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('PUT /api/leads - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _request.json();
    console.log('PUT /api/leads - Request body:', body);
    const { id, nombre, direccion, website, socialMedia, whatsapp, email, contacted, estado, meetingSet, contactMethods, futureContactDate } = body;

    if (!id) {
      console.log('PUT /api/leads - Lead ID is required');
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    client = createPool({
      connectionString: process.env.POSTGRES_URL
    });
    console.log('PUT /api/leads - Connecting to database');
    await client.connect();

    // Find user
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    console.log('PUT /api/leads - User query result:', userResult.rows);
    if (userResult.rows.length === 0) {
      console.log('PUT /api/leads - Usuario no encontrado');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    // Verify lead ownership
    console.log('PUT /api/leads - User found, verifying lead ownership');
    const existingLead = await client.query('SELECT * FROM "Lead" WHERE id = $1 AND "userId" = $2', [id, userId]);
    console.log('PUT /api/leads - Existing lead query result:', existingLead.rows);
    if (existingLead.rows.length === 0) {
      console.log('PUT /api/leads - Lead not found or unauthorized');
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    // Update lead
    console.log('PUT /api/leads - Updating lead');
    const now = new Date().toISOString();
    const updateResult = await client.query(
      `UPDATE "Lead" 
       SET nombre = $1, direccion = $2, website = $3, "socialMedia" = $4, whatsapp = $5, email = $6, 
           contacted = $7, estado = $8, "meetingSet" = $9, "contactMethods" = $10, "futureContactDate" = $11, updated_at = $12
       WHERE id = $13 AND "userId" = $14
       RETURNING *`,
      [
        nombre,
        direccion || null,
        website || null,
        socialMedia || null,
        whatsapp || null,
        email || null,
        contacted,
        estado,
        meetingSet,
        contactMethods ? JSON.stringify(contactMethods) : null,
        futureContactDate || null,
        now,
        id,
        userId
      ]
    );
    console.log('PUT /api/leads - Lead updated:', updateResult.rows);
    return NextResponse.json(updateResult.rows[0]);
  } catch (error) {
    console.error('PUT /api/leads - Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest) {
  let client;
  try {
    console.log('DELETE /api/leads - Handler started');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('DELETE /api/leads - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _request.json();
    console.log('DELETE /api/leads - Request body:', body);
    const { id } = body;

    if (!id) {
      console.log('DELETE /api/leads - Lead ID is required');
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    client = createPool({
      connectionString: process.env.POSTGRES_URL
    });
    console.log('DELETE /api/leads - Connecting to database');
    await client.connect();

    // Get user by email
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );
    console.log('DELETE /api/leads - User query result:', userResult.rows);

    if (userResult.rows.length === 0) {
      console.log('DELETE /api/leads - User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    console.log('DELETE /api/leads - User found, verifying lead ownership');

    // Verify the lead belongs to this user
    const existingLeadResult = await client.query(
      'SELECT * FROM "Lead" WHERE id = $1 AND "userId" = $2',
      [id, user.id]
    );
    console.log('DELETE /api/leads - Existing lead query result:', existingLeadResult.rows);

    if (existingLeadResult.rows.length === 0) {
      console.log('DELETE /api/leads - Lead not found');
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Delete lead
    console.log('DELETE /api/leads - Deleting lead');
    await client.query('DELETE FROM "Lead" WHERE id = $1', [id]);
    console.log('DELETE /api/leads - Lead deleted');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/leads - Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 