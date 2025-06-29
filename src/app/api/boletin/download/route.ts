import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const ALLOWED_PREFIX = 'https://portaltramites.inpi.gob.ar/Uploads/Boletines/';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url || !url.startsWith(ALLOWED_PREFIX)) {
    return NextResponse.json({ error: 'URL inválida o no permitida.' }, { status: 400 });
  }

  try {
    const pdfRes = await fetch(url);
    if (!pdfRes.ok) {
      return NextResponse.json({ error: 'No se pudo descargar el PDF.' }, { status: 502 });
    }
    const pdfBuffer = await pdfRes.arrayBuffer();
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${url.split('/').pop() || 'boletin.pdf'}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Error interno del servidor.';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
} 