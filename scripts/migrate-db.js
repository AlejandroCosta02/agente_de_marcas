// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@vercel/postgres');

function getConnectionConfig() {
  const url = process.env.POSTGRES_URL_NON_POOLING;
  if (!url) {
    throw new Error('POSTGRES_URL_NON_POOLING environment variable is required');
  }
  
  return url;
}

async function runUsersMigration() {
  try {
    const client = createClient({
      connectionString: getConnectionConfig()
    });
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.end();
    console.log('✅ Users table created or verified');
    return true;
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    return false;
  }
}

async function runMarcasMigration() {
  try {
    const client = createClient({
      connectionString: getConnectionConfig()
    });
    await client.connect();
    
    // First check if the table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'marcas'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create the table with all columns if it doesn't exist
      await client.query(`
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
      console.log('✅ Created marcas table with all columns');
    }

    // If table exists, check and add missing columns
    console.log('Checking for missing columns...');

    // Check for tipo_marca column
    const tipoMarcaExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marcas' 
        AND column_name = 'tipo_marca'
      );
    `);

    if (!tipoMarcaExists.rows[0].exists) {
      await client.query(`
        ALTER TABLE marcas 
        ADD COLUMN tipo_marca VARCHAR(255) DEFAULT 'denominativa';
      `);
      console.log('✅ Added tipo_marca column');
    }

    // Check for clases column
    const clasesExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marcas' 
        AND column_name = 'clases'
      );
    `);

    if (!clasesExists.rows[0].exists) {
      await client.query(`
        ALTER TABLE marcas 
        ADD COLUMN clases INTEGER[] DEFAULT ARRAY[]::INTEGER[];
      `);
      console.log('✅ Added clases column');
    }

    // Check oposicion column type
    const oposicionType = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'marcas' 
      AND column_name = 'oposicion';
    `);

    if (oposicionType.rows[0]?.data_type !== 'jsonb') {
      await client.query(`
        ALTER TABLE marcas 
        ALTER COLUMN oposicion TYPE JSONB 
        USING CASE 
          WHEN oposicion IS NULL THEN '[]'::jsonb
          WHEN oposicion = ARRAY[]::TEXT[] THEN '[]'::jsonb
          ELSE json_build_array(json_build_object('text', oposicion[1], 'completed', false))::jsonb
        END;
      `);
      console.log('✅ Updated oposicion column to JSONB');
    }

    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Error updating marcas table:', error);
    return false;
  }
}

async function runMarcaFilesMigration() {
  try {
    const client = createClient({
      connectionString: getConnectionConfig()
    });
    await client.connect();
    
    // Create marca_files table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marca_files (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        marca_id UUID NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        s3_url TEXT NOT NULL,
        s3_key VARCHAR(500) NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_marca_files_marca_id ON marca_files(marca_id);
    `);

    // Add trigger to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_marca_files_updated_at ON marca_files;
      CREATE TRIGGER update_marca_files_updated_at 
          BEFORE UPDATE ON marca_files 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.end();
    console.log('✅ Marca files table created or verified');
    return true;
  } catch (error) {
    console.error('❌ Error creating marca_files table:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting migrations...');
    
    const usersResult = await runUsersMigration();
    console.log('Users migration completed:', usersResult);
    
    const marcasResult = await runMarcasMigration();
    console.log('Marcas migration completed:', marcasResult);

    const marcaFilesResult = await runMarcaFilesMigration();
    console.log('Marca files migration completed:', marcaFilesResult);

    if (!usersResult || !marcasResult || !marcaFilesResult) {
      console.error('❌ Some migrations failed');
      process.exit(1);
    }

    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

main(); 