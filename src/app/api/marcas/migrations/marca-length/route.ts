import { NextResponse } from 'next/server';
import { runMarcaLengthMigration } from '../run_marca_length_migration';

export async function POST() {
  try {
    const success = await runMarcaLengthMigration();
    
    if (success) {
      return NextResponse.json(
        { message: 'Marca length migration completed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to run marca length migration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error running marca length migration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 