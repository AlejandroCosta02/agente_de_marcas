import { sql } from '@vercel/postgres';

export async function runMigrations() {
  try {
    // Read and execute the migration SQL
    await sql`
      -- Update marca column to allow longer names
      ALTER TABLE marcas
      ALTER COLUMN marca TYPE VARCHAR(255);

      -- Remove acta and resolucion columns
      ALTER TABLE marcas
      DROP COLUMN IF EXISTS acta,
      DROP COLUMN IF EXISTS resolucion;

      -- Add titulares column to marcas table
      ALTER TABLE marcas ADD COLUMN IF NOT EXISTS titulares JSONB DEFAULT '[]'::jsonb;

      -- Update existing records to have at least one titular in the titulares array
      -- based on the existing titular_nombre, titular_email, and titular_telefono fields
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
    `;
    
    console.log('✅ Successfully updated database schema');
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
} 