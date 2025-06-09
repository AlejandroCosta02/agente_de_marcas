const { createClient } = require('@vercel/postgres');

function getConnectionConfig() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  // Add pooling parameters if they don't exist
  if (!url.includes('connection_limit')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}sslmode=require&connection_limit=5&pool_timeout=0`;
  }
  
  return url;
}

async function runUsersMigration() {
  try {
    const client = createClient();
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
    const client = createClient();
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

async function main() {
  try {
    console.log('🚀 Starting migrations...');
    
    const usersResult = await runUsersMigration();
    console.log('Users migration completed:', usersResult);
    
    const marcasResult = await runMarcasMigration();
    console.log('Marcas migration completed:', marcasResult);

    if (!usersResult || !marcasResult) {
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