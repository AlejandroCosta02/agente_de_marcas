import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { del } from '@vercel/blob';

export async function DELETE(
  request: NextRequest,
  context: { params: { marcaId: string; fileId: string } }
): Promise<NextResponse> {
  const pool = createPool();
  // Get file info
  const { rows } = await pool.query(
    'SELECT filename FROM marca_files WHERE id = $1 AND marca_id = $2',
    [context.params.fileId, context.params.marcaId]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  const filename = rows[0].filename;
  
  try {
    // Delete from Vercel Blob
    await del(filename);
    
    // Delete from DB
    await pool.query('DELETE FROM marca_files WHERE id = $1 AND marca_id = $2', [context.params.fileId, context.params.marcaId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
  }
} 