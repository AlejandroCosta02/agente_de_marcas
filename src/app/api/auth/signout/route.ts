import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'No active session' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
} 