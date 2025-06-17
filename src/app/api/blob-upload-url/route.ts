import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    if (!contentType) {
      return NextResponse.json({ error: 'Content type is required' }, { status: 400 });
    }

    const blob = await put(filename, new Blob([], { type: contentType }), {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}