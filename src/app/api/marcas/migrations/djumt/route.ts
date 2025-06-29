import { NextResponse } from 'next/server';
import { runDjumtMigration } from '../run_djumt_migration';

export async function POST() {
  try {
    const success = await runDjumtMigration();
    
    if (success) {
      return NextResponse.json(
        { message: 'DJUMT migration completed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to run DJUMT migration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error running DJUMT migration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 