import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';

async function runUsersMigration() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Users table created or verified');
    return true;
  } catch (error) {
    console.error('Error creating users table:', error);
    return false;
  }
}

async function runMarcasMigration() {
  try {
    // First ensure the table exists with basic structure
    await sql`
      CREATE TABLE IF NOT EXISTS marcas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        marca VARCHAR(20) NOT NULL,
        acta INTEGER NOT NULL CHECK (acta > 0 AND acta < 100000000),
        resolucion INTEGER NOT NULL CHECK (resolucion > 0 AND resolucion < 100000000),
        renovar DATE NOT NULL,
        vencimiento DATE NOT NULL,
        titular_nombre VARCHAR(100) NOT NULL,
        titular_email VARCHAR(100) NOT NULL,
        titular_telefono VARCHAR(20) NOT NULL,
        anotaciones TEXT[] DEFAULT '{}',
        oposicion JSONB DEFAULT '[]',
        user_email VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Marcas table created or verified');

    // Add tipo_marca column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marcas' AND column_name = 'tipo_marca') THEN
          ALTER TABLE marcas ADD COLUMN tipo_marca VARCHAR(255) DEFAULT 'denominativa';
        END IF;
      END $$;
    `;
    console.log('Added or verified tipo_marca column');

    // Add clases column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marcas' AND column_name = 'clases') THEN
          ALTER TABLE marcas ADD COLUMN clases INTEGER[] DEFAULT ARRAY[]::INTEGER[];
        END IF;
      END $$;
    `;
    console.log('Added or verified clases column');

    // Update oposicion column to use JSONB if needed
    await sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'marcas' 
          AND column_name = 'oposicion' 
          AND data_type != 'jsonb'
        ) THEN
          ALTER TABLE marcas 
          ALTER COLUMN oposicion TYPE JSONB USING CASE 
            WHEN oposicion IS NULL THEN '[]'::jsonb
            WHEN oposicion = ARRAY[]::TEXT[] THEN '[]'::jsonb
            ELSE json_build_array(json_build_object('text', oposicion[1], 'completed', false))::jsonb
          END;
        END IF;
      END $$;
    `;
    console.log('Verified oposicion column as JSONB');

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

    console.log('Starting migrations...');
    const usersResult = await runUsersMigration();
    console.log('Users migration completed:', usersResult);
    
    const marcasResult = await runMarcasMigration();
    console.log('Marcas migration completed:', marcasResult);

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