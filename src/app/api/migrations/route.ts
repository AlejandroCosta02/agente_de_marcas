import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';

async function runUsersMigration() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Users table created or already exists');
    return true;
  } catch (error) {
    console.error('Error creating users table:', error);
    return false;
  }
}

async function runMarcasMigration() {
  try {
    // Add tipo_marca column
    await sql`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS tipo_marca VARCHAR(255) DEFAULT 'denominativa';`;
    console.log('Added tipo_marca column');

    // Add clases column
    await sql`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS clases INTEGER[] DEFAULT ARRAY[]::INTEGER[];`;
    console.log('Added clases column');

    // Update oposicion column to use JSONB
    await sql`
      ALTER TABLE marcas 
      ALTER COLUMN oposicion TYPE JSONB USING CASE 
        WHEN oposicion IS NULL THEN '[]'::jsonb
        WHEN oposicion = ARRAY[]::TEXT[] THEN '[]'::jsonb
        ELSE json_build_array(json_build_object('text', oposicion[1], 'completed', false))::jsonb
      END;
    `;
    console.log('Updated oposicion column to JSONB');
    return true;
  } catch (error) {
    console.error('Error updating marcas table:', error);
    return false;
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const usersResult = await runUsersMigration();
    const marcasResult = await runMarcasMigration();

    if (!usersResult || !marcasResult) {
      return NextResponse.json({ 
        message: 'Error al ejecutar algunas migraciones',
        users: usersResult,
        marcas: marcasResult
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Migraciones completadas exitosamente',
      users: usersResult,
      marcas: marcasResult
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json({ 
      message: 'Error al ejecutar las migraciones',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 