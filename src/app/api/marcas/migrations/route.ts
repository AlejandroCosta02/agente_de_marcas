import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runMigrations } from './run_migrations';

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Run migrations
    const result = await runMigrations();
    
    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Migración completada exitosamente' });
  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
} 