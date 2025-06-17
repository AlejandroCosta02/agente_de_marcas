/* eslint-disable @typescript-eslint/no-explicit-any */
import { del } from '@vercel/blob';
import { createPool } from '@vercel/postgres';

export async function DELETE(
  request: Request,
  context: any
) {
  const { params } = context;
  const pool = createPool();
  // Get file info
  const { rows } = await pool.query(
    'SELECT filename FROM marca_files WHERE id = $1 AND marca_id = $2',
    [params.fileId, params.marcaId]
  );
  if (rows.length === 0) {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }
  const filename = rows[0].filename;
  
  try {
    // Delete from Vercel Blob
    await del(filename);
    
    // Delete from DB
    await pool.query('DELETE FROM marca_files WHERE id = $1 AND marca_id = $2', [params.fileId, params.marcaId]);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return Response.json({ error: 'Error deleting file' }, { status: 500 });
  }
} 