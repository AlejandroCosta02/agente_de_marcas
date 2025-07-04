import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

async function runUsersMigration() {
  try {
    const pool = createPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created or verified');
    return true;
  } catch (error) {
    console.error('Error creating users table:', error);
    return false;
  }
}

async function runMarcasMigration() {
  try {
    const pool = createPool();
    
    // First check if the table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'marcas'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create the table with all columns if it doesn't exist
      await pool.query(`
        CREATE TABLE marcas (
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
          tipo_marca VARCHAR(255) DEFAULT 'denominativa',
          clases INTEGER[] DEFAULT ARRAY[]::INTEGER[],
          user_email VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Created marcas table with all columns');
      return true;
    }

    // If table exists, check and add missing columns
    console.log('Checking for missing columns...');

    // Check for tipo_marca column
    const tipoMarcaExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marcas' 
        AND column_name = 'tipo_marca'
      );
    `);

    if (!tipoMarcaExists.rows[0].exists) {
      await pool.query(`
        ALTER TABLE marcas 
        ADD COLUMN tipo_marca VARCHAR(255) DEFAULT 'denominativa';
      `);
      console.log('Added tipo_marca column');
    }

    // Check for clases column
    const clasesExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marcas' 
        AND column_name = 'clases'
      );
    `);

    if (!clasesExists.rows[0].exists) {
      await pool.query(`
        ALTER TABLE marcas 
        ADD COLUMN clases INTEGER[] DEFAULT ARRAY[]::INTEGER[];
      `);
      console.log('Added clases column');
    }

    // Check oposicion column type
    const oposicionType = await pool.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'marcas' 
      AND column_name = 'oposicion';
    `);

    if (oposicionType.rows[0]?.data_type !== 'jsonb') {
      await pool.query(`
        ALTER TABLE marcas 
        ALTER COLUMN oposicion TYPE JSONB 
        USING CASE 
          WHEN oposicion IS NULL THEN '[]'::jsonb
          WHEN oposicion = ARRAY[]::TEXT[] THEN '[]'::jsonb
          ELSE json_build_array(json_build_object('text', oposicion[1], 'completed', false))::jsonb
        END;
      `);
      console.log('Updated oposicion column to JSONB');
    }

    // Check for titulares column
    const titularesExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marcas' 
        AND column_name = 'titulares'
      );
    `);

    if (!titularesExists.rows[0].exists) {
      await pool.query(`
        ALTER TABLE marcas 
        ADD COLUMN titulares JSONB DEFAULT '[]'::jsonb;
      `);
      console.log('Added titulares column');

      // Update existing records to have at least one titular in the titulares array
      const updateResult = await pool.query(`
        UPDATE marcas 
        SET titulares = jsonb_build_array(
          jsonb_build_object(
            'id', gen_random_uuid()::text,
            'fullName', COALESCE(titular_nombre, ''),
            'email', COALESCE(titular_email, ''),
            'phone', COALESCE(titular_telefono, '')
          )
        )
        WHERE titulares IS NULL OR titulares = '[]'::jsonb;
      `);
      console.log(`Updated ${updateResult.rowCount} existing records with titulares data`);
    }

    return true;
  } catch (error) {
    console.error('Error updating marcas table:', error);
    return false;
  }
}

async function runResetTokenMigration() {
  try {
    const pool = createPool();
    
    // Check for reset_token column
    const resetTokenExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'reset_token'
      );
    `);

    if (!resetTokenExists.rows[0].exists) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN reset_token VARCHAR(255),
        ADD COLUMN reset_token_expiry TIMESTAMP;
      `);
      console.log('Added reset_token and reset_token_expiry columns');
    }

    // Check for reset_token_expiry column
    const resetTokenExpiryExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'reset_token_expiry'
      );
    `);

    if (!resetTokenExpiryExists.rows[0].exists) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN reset_token_expiry TIMESTAMP;
      `);
      console.log('Added reset_token_expiry column');
    }

    // Create indexes for faster lookups
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_users_reset_token_expiry ON users(reset_token_expiry);
      `);
      console.log('Created reset token indexes');
    } catch (indexError) {
      console.log('Indexes already exist or error creating them:', indexError);
    }

    return true;
  } catch (error) {
    console.error('Error updating users table for reset tokens:', error);
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

    const resetTokenResult = await runResetTokenMigration();
    console.log('Reset token migration completed:', resetTokenResult);

    if (!usersResult || !marcasResult || !resetTokenResult) {
      return NextResponse.json({ 
        message: 'Error al ejecutar algunas migraciones',
        users: usersResult,
        marcas: marcasResult,
        resetToken: resetTokenResult
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Migraciones completadas exitosamente',
      users: usersResult,
      marcas: marcasResult,
      resetToken: resetTokenResult
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json({ 
      message: 'Error al ejecutar las migraciones',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 