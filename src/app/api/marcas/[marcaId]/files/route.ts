/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(
  request: Request,
  context: any
) {
  const { params } = context;
  const pool = createPool();
  const { rows } = await pool.query(
    'SELECT id, filename, original_name, size, uploaded_at FROM marca_files WHERE marca_id = $1 ORDER BY uploaded_at DESC',
    [params.marcaId]
  );
  return NextResponse.json({ files: rows });
}

export async function POST(
  request: Request,
  context: any
) {
  const { params } = context;
  const form = formidable({
    multiples: false,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    filter: (part: { mimetype?: string | null }) => part.mimetype === 'application/pdf',
  });

  return await new Promise<Response>((resolve) => {
    form.parse(request as unknown as IncomingMessage, async (err, fields, files) => {
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

      try {
        // Upload to Vercel Blob
        const blob = await put(uploadedFile.originalFilename || 'file.pdf', uploadedFile.filepath, {
          access: 'public',
          addRandomSuffix: true,
        });

        const pool = createPool();
        const { rows } = await pool.query(
          'INSERT INTO marca_files (marca_id, filename, original_name, size) VALUES ($1, $2, $3, $4) RETURNING id, filename, original_name, size, uploaded_at',
          [params.marcaId, blob.url, uploadedFile.originalFilename, fileSize]
        );
        resolve(NextResponse.json({ file: rows[0] }));
      } catch (error) {
        console.error('Error uploading file:', error);
        resolve(NextResponse.json({ error: 'Error uploading file.' }, { status: 500 }));
      }
    });
  });
} 