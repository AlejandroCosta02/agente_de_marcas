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
    `;
    
    console.log('✅ Successfully updated database schema');
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
} 