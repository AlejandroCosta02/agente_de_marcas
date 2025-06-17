import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    let bodyText = '';
    try {
      bodyText = await request.text();
      console.log('Raw request body:', bodyText);
    } catch (e) {
      console.error('Error reading request body as text:', e);
    }
    let filename = '';
    let contentType = '';
    try {
      const body = JSON.parse(bodyText);
      filename = body.filename;
      contentType = body.contentType;
      console.log('Parsed filename:', filename);
      console.log('Parsed contentType:', contentType);
    } catch (e) {
      console.error('Error parsing JSON body:', e);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!filename) {
      console.error('Missing filename');
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    if (!contentType) {
      console.error('Missing contentType');
      return NextResponse.json({ error: 'Content type is required' }, { status: 400 });
    }
    let tempBlob;
    try {
      tempBlob = await put(filename, new Blob([], { type: contentType }), {
        access: 'public',
        addRandomSuffix: true,
        contentType,
      });
      console.log('Blob upload result:', tempBlob);
    } catch (e) {
      console.error('Error calling put() on Vercel Blob:', e);
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to generate upload URL' }, { status: 500 });
    }
    return NextResponse.json({
      uploadUrl: tempBlob.url,
      blobUrl: tempBlob.url,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Unexpected error in /api/blob-upload-url:', error, error.stack);
    } else {
      console.error('Unexpected error in /api/blob-upload-url:', error);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}