import { NextResponse } from 'next/server';
import { getLatestBoletinUrl } from '@/lib/boletin';

export async function GET() {
  try {
    const url = await getLatestBoletinUrl();
    return NextResponse.json({ url });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Error al obtener el boletín';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
} 