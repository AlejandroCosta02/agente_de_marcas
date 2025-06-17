import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function DELETE(req: Request, { params }: { params: { marcaId: string, fileId: string } }) {
  const pool = createPool();
  // Get file info
  const { rows } = await pool.query(
    'SELECT filename FROM marca_files WHERE id = $1 AND marca_id = $2',
    [params.fileId, params.marcaId]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  const filename = rows[0].filename;
  // Delete file from disk
  try {
    fs.unlinkSync(path.join(UPLOAD_DIR, filename));
  } catch (e) {
    // Ignore if file does not exist
  }
  // Delete from DB
  await pool.query('DELETE FROM marca_files WHERE id = $1 AND marca_id = $2', [params.fileId, params.marcaId]);
  return NextResponse.json({ success: true });
} 