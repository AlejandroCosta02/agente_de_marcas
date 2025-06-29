import { NextResponse } from 'next/server';
import { runWelcomeMigration } from '../run_welcome_migration';

export async function POST() {
  try {
    const success = await runWelcomeMigration();
    
    if (success) {
      return NextResponse.json(
        { message: 'Welcome migration completed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to run welcome migration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error running welcome migration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 