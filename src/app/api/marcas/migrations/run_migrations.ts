import { sql } from '@vercel/postgres';

export async function runMigrations() {
  try {
    // Read and execute the migration SQL
    await sql`
      -- Update marca column to allow longer names
      ALTER TABLE marcas
      ALTER COLUMN marca TYPE VARCHAR(255);
    `;
    
    console.log('✅ Successfully updated marca column length');
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
} 