import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Must be logged in to sign out' }),
      { status: 401 }
    );
  }

  return new NextResponse(JSON.stringify({ message: 'Successfully signed out' }));
} 