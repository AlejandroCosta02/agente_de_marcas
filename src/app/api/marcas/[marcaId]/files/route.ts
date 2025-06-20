import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marcaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marcaId } = await params;
    const pool = createPool();

    // Verify the marca belongs to the user
    const marcaResult = await pool.query(
      'SELECT id FROM marcas WHERE id = $1 AND user_email = $2',
      [marcaId, session.user.email]
    );

    if (marcaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Marca not found' }, { status: 404 });
    }

    // Get all files for this marca
    const filesResult = await pool.query(
      `SELECT 
        id, 
        filename, 
        original_name, 
        size, 
        uploaded_at
       FROM marca_files 
       WHERE marca_id = $1 
       ORDER BY uploaded_at DESC`,
      [marcaId]
    );

    return NextResponse.json(filesResult.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ marcaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marcaId } = await params;
    const body = await request.json();
    const { filename, original_name, size, s3_url, s3_key } = body;
    const pool = createPool();

    // Validate required fields
    if (!filename || !original_name || !size || !s3_url || !s3_key) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the marca belongs to the user
    const marcaResult = await pool.query(
      'SELECT id FROM marcas WHERE id = $1 AND user_email = $2',
      [marcaId, session.user.email]
    );

    if (marcaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Marca not found' }, { status: 404 });
    }

    // Insert the file record
    const result = await pool.query(
      `INSERT INTO marca_files 
       (marca_id, filename, original_name, size, s3_url, s3_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, filename, original_name, size, uploaded_at`,
      [marcaId, filename, original_name, size, s3_url, s3_key]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating file record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 