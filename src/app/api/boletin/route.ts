import { NextResponse } from 'next/server';
import { getLatestBoletinUrl } from '@/lib/boletin';

export async function GET() {
  try {
    const url = await getLatestBoletinUrl();
    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener el boletín' }, { status: 500 });
  }
} 