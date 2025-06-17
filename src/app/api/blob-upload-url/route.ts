import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  return await new Promise<Response>((resolve) => {
    const form = formidable();
    form.parse(request as unknown as IncomingMessage, async (err, fields, files) => {
      if (err) {
        return resolve(NextResponse.json({ error: 'Error parsing file' }, { status: 400 }));
      }
      const file = files.file;
      if (!file) {
        return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
      }
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      try {
        const blob = await put(uploadedFile.originalFilename || 'file.pdf', uploadedFile.filepath, {
          access: 'public',
          addRandomSuffix: true,
        });
        resolve(NextResponse.json({ url: blob.url }));
      } catch (error) {
        resolve(NextResponse.json({ error: 'Failed to upload to blob' }, { status: 500 }));
      }
    });
  });
}