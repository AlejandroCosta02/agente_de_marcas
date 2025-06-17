import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function GET(req: Request, { params }: { params: { marcaId: string } }) {
  const pool = createPool();
  const { rows } = await pool.query(
    'SELECT id, filename, original_name, size, uploaded_at FROM marca_files WHERE marca_id = $1 ORDER BY uploaded_at DESC',
    [params.marcaId]
  );
  return NextResponse.json({ files: rows });
}

export async function POST(req: Request, { params }: { params: { marcaId: string } }) {
  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
  }

  // Parse form with formidable
  const form = formidable({
    multiples: false,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    filter: (part: { mimetype?: string | null }) => part.mimetype === 'application/pdf',
  });

  return new Promise((resolve) => {
    form.parse(req as unknown as IncomingMessage, async (err, fields, files) => {
      if (err) return resolve(NextResponse.json({ error: 'Error uploading file or file too large.' }, { status: 400 }));
      const file = files.file;
      if (!file) {
        return resolve(NextResponse.json({ error: 'No file uploaded.' }, { status: 400 }));
      }
      const fileArray = Array.isArray(file) ? file : [file];
      const uploadedFile = fileArray[0];
      if (!uploadedFile) {
        return resolve(NextResponse.json({ error: 'No file uploaded.' }, { status: 400 }));
      }
      const fileSize = uploadedFile.size;
      if (fileSize > 2 * 1024 * 1024) {
        return resolve(NextResponse.json({ error: 'File size exceeds 2MB limit.' }, { status: 400 }));
      }
      const fileType = uploadedFile.mimetype;
      if (fileType !== 'application/pdf') {
        return resolve(NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 }));
      }
      const filename = `${Date.now()}-${uploadedFile.originalFilename}`;
      const filepath = path.join(UPLOAD_DIR, filename);
      fs.renameSync(uploadedFile.filepath, filepath);
      const pool = createPool();
      const { rows } = await pool.query(
        'INSERT INTO marca_files (marca_id, filename, original_name, size) VALUES ($1, $2, $3, $4) RETURNING id, filename, original_name, size, uploaded_at',
        [params.marcaId, filename, uploadedFile.originalFilename, fileSize]
      );
      resolve(NextResponse.json({ file: rows[0] }));
    });
  });
} 