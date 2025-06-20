import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marcaId: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marcaId, fileId } = await params;
    const pool = createPool();

    // Verify the marca belongs to the user and get the file
    const result = await pool.query(
      `SELECT 
        f.id, 
        f.filename, 
        f.original_name, 
        f.size, 
        f.s3_url, 
        f.s3_key,
        f.uploaded_at
       FROM marca_files f
       JOIN marcas m ON f.marca_id = m.id
       WHERE f.id = $1 AND f.marca_id = $2 AND m.user_email = $3`,
      [fileId, marcaId, session.user.email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ marcaId: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marcaId, fileId } = await params;
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

    // Verify the marca belongs to the user and get the old file
    const verifyResult = await pool.query(
      `SELECT f.s3_key, f.s3_url
       FROM marca_files f
       JOIN marcas m ON f.marca_id = m.id
       WHERE f.id = $1 AND f.marca_id = $2 AND m.user_email = $3`,
      [fileId, marcaId, session.user.email]
    );

    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const oldFile = verifyResult.rows[0];

    // Update the file record
    const result = await pool.query(
      `UPDATE marca_files 
       SET filename = $1, original_name = $2, size = $3, s3_url = $4, s3_key = $5
       WHERE id = $6 AND marca_id = $7
       RETURNING id, filename, original_name, size, s3_url, uploaded_at`,
      [filename, original_name, size, s3_url, s3_key, fileId, marcaId]
    );

    // Delete the old file from S3
    if (oldFile.s3_key !== s3_key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: oldFile.s3_key,
        });
        await s3Client.send(deleteCommand);
      } catch (error) {
        console.warn('Error deleting old file from S3:', error);
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ marcaId: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { marcaId, fileId } = await params;
    const pool = createPool();

    // Verify the marca belongs to the user
    const marcaResult = await pool.query(
      'SELECT id FROM marcas WHERE id = $1 AND user_email = $2',
      [marcaId, session.user.email]
    );

    if (marcaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Marca not found' }, { status: 404 });
    }

    // Get the file record
    const fileResult = await pool.query(
      'SELECT * FROM marca_files WHERE id = $1 AND marca_id = $2',
      [fileId, marcaId]
    );

    if (fileResult.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileResult.rows[0];

    // Delete from S3 if s3_key exists
    if (file.s3_key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: file.s3_key,
        });
        await s3Client.send(deleteCommand);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await pool.query(
      'DELETE FROM marca_files WHERE id = $1',
      [fileId]
    );

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 